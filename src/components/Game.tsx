// Game.tsx
import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, View, Text } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import { Colors } from "../styles/colors";
import { Direction, Coordinate, GestureEventType } from "../types/types";
import { checkGameOver } from "../utils/checkGameOver";
import { randomFoodPosition } from "../utils/randomFoodPosition";
import Food from "./Food";
import WrongFruit from "./WrongFruit";
import Header from "./Header";
import Score from "./Score";
import Snake from "./Snake";
import LevelSelection from "./LevelSelection";

const SNAKE_INITIAL_POSITION: Coordinate[] = [{ x: 5, y: 5 }];
const FOOD_INITIAL_POSITION: Coordinate = { x: 5, y: 20 };
const GAME_BOUNDS = { xMin: 0, xMax: 35, yMin: 0, yMax: 63 };
const MOVE_INTERVAL = 200;
const SCORE_INCREMENT = 10;

function getRandomFruitEmoji(): string {
  const fruitEmojis = ["🍎", "🍊", "🍋", "🍇", "🍉", "🍓", "🍑", "🍍"];
  const randomIndex = Math.floor(Math.random() * fruitEmojis.length);
  return fruitEmojis[randomIndex];
}

export default function Game(): JSX.Element {
  const [direction, setDirection] = useState<Direction>(Direction.Right);
  const [snake, setSnake] = useState<Coordinate[]>(SNAKE_INITIAL_POSITION);
  const [food, setFood] = useState<Coordinate>(FOOD_INITIAL_POSITION);
  const [wrongFruits, setWrongFruits] = useState<Coordinate[]>([]);
  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(1);
  const [isLevelSelected, setIsLevelSelected] = useState<boolean>(false);
  const [rightFruitEmoji, setRightFruitEmoji] = useState<string>(getRandomFruitEmoji());

  // Initialize wrong fruits based on level
  const initializeWrongFruits = (count: number) => {
    const newWrongFruits: Coordinate[] = [];
    for (let i = 0; i < count; i++) {
      const position = randomFoodPosition(
        GAME_BOUNDS.xMax,
        GAME_BOUNDS.yMax,
        [...snake, food, ...newWrongFruits]
      );
      newWrongFruits.push(position);
    }
    setWrongFruits(newWrongFruits);
  };

  // Handle level selection
  const handleLevelSelect = (selectedLevel: number) => {
    setLevel(selectedLevel);
    setIsLevelSelected(true);
    initializeWrongFruits(selectedLevel + 2); // Number of wrong fruits increases with level
  };

  const getMoveInterval = () => {
    const speedIncrease = (level - 1) * 20;
    const interval = MOVE_INTERVAL - speedIncrease;
    return interval > 50 ? interval : 50;
  };

  useEffect(() => {
    if (!isGameOver && isLevelSelected) {
      const intervalId = setInterval(() => {
        if (!isPaused) moveSnake();
      }, getMoveInterval());
      return () => clearInterval(intervalId);
    }
  }, [snake, isGameOver, isPaused, level, isLevelSelected]);

  const spawnNewFood = () => {
    const newFoodPosition = randomFoodPosition(
      GAME_BOUNDS.xMax,
      GAME_BOUNDS.yMax,
      [...snake, ...wrongFruits]
    );
    setFood(newFoodPosition);
    setRightFruitEmoji(getRandomFruitEmoji());
  };

  const moveSnake = () => {
    const snakeHead = snake[0];
    const newHead: Coordinate = { ...snakeHead };

    // Change direction based on current direction
    switch (direction) {
      case Direction.Up:
        newHead.y -= 1;
        break;
      case Direction.Down:
        newHead.y += 1;
        break;
      case Direction.Left:
        newHead.x -= 1;
        break;
      case Direction.Right:
        newHead.x += 1;
        break;
      default:
        break;
    }

    // Check for game over conditions using existing checkGameOver function
    if (checkGameOver(newHead, GAME_BOUNDS)) {
      setIsGameOver(true);
      return;
    }

    // Check collision with wrong fruits
    const hasEatenWrongFruit = wrongFruits.some(
      (fruit) => fruit.x === newHead.x && fruit.y === newHead.y
    );
    if (hasEatenWrongFruit) {
      setIsGameOver(true);
      return;
    }

    // Check if snake eats food
    if (newHead.x === food.x && newHead.y === food.y) {
      spawnNewFood();
      setSnake([newHead, ...snake]);
      setScore(score + SCORE_INCREMENT);
    } else {
      setSnake([newHead, ...snake.slice(0, -1)]);
    }
  };

  const handleGesture = (event: GestureEventType) => {
    const { translationX, translationY } = event.nativeEvent;
    let newDirection = direction;

    if (Math.abs(translationX) > Math.abs(translationY)) {
      if (translationX > 0 && direction !== Direction.Left) {
        newDirection = Direction.Right;
      } else if (translationX < 0 && direction !== Direction.Right) {
        newDirection = Direction.Left;
      }
    } else {
      if (translationY > 0 && direction !== Direction.Up) {
        newDirection = Direction.Down;
      } else if (translationY < 0 && direction !== Direction.Down) {
        newDirection = Direction.Up;
      }
    }

    setDirection(newDirection);
  };

  const reloadGame = () => {
    setIsLevelSelected(false);
    setLevel(1);
    setSnake(SNAKE_INITIAL_POSITION);
    setFood(FOOD_INITIAL_POSITION);
    setIsGameOver(false);
    setScore(0);
    setDirection(Direction.Right);
    setIsPaused(false);
    setRightFruitEmoji(getRandomFruitEmoji());
  };

  const pauseGame = () => {
    setIsPaused(!isPaused);
  };

  if (!isLevelSelected) {
    return <LevelSelection onLevelSelect={handleLevelSelect} />;
  }

  return (
    <PanGestureHandler onGestureEvent={handleGesture}>
      <SafeAreaView style={styles.container}>
        <Header
          reloadGame={reloadGame}
          pauseGame={pauseGame}
          isPaused={isPaused}
          rightFruitEmoji={rightFruitEmoji}
        >
          <View style={styles.headerContent}>
            <Score score={score} />
            <Text style={styles.levelText}>Level: {level}</Text>
          </View>
        </Header>
        <View style={styles.boundaries}>
          <Snake snake={snake} />
          <Food x={food.x} y={food.y} emoji={rightFruitEmoji} />
          {wrongFruits.map((fruit, index) => (
            <WrongFruit key={index} x={fruit.x} y={fruit.y} />
          ))}
        </View>
      </SafeAreaView>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  boundaries: {
    flex: 1,
    borderColor: Colors.primary,
    borderWidth: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: Colors.background,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  levelText: {
    fontSize: 18,
    color: "#12181e",
    textAlign: "center",
    marginLeft: 10,
  },
});
