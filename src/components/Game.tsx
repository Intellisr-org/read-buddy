import React, { useEffect, useState, useContext } from "react";
import { SafeAreaView, StyleSheet, View, Text, Dimensions, ScrollView, TouchableOpacity } from "react-native";
import { PanGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler";
import { Colors } from "../styles/colors";
import { Direction, Coordinate, GestureEventType } from "../types/types";
import { checkGameOver } from "../utils/checkGameOver";
import { randomFoodPosition } from "../utils/randomFoodPosition";
import Food from "./Food";
import WrongFruit from "./WrongFruit";
import Header from "./Header";
import Score from "./Score";
import Snake from "./Snake";
import firestore from '@react-native-firebase/firestore';
import { AppContext } from '../App.tsx';
import gameResults from '../data/game_result.json';

const SNAKE_INITIAL_POSITION: Coordinate[] = [{ x: 5, y: 5 }];
const FOOD_INITIAL_POSITION: Coordinate = { x: 5, y: 20 };
const GAME_BOUNDS = { xMin: 0, xMax: 35, yMin: 0, yMax: 59 };
const MOVE_INTERVAL = 200;
const SCORE_INCREMENT = 10;

function getRandomFruitEmoji(): string {
  const fruitEmojis = ["🍎", "🍊", "🍋", "🍇", "🍉", "🍓", "🍑", "🍍"];
  const randomIndex = Math.floor(Math.random() * fruitEmojis.length);
  return fruitEmojis[randomIndex];
}

export default function Game(): JSX.Element {
  const { loggedInUser } = useContext(AppContext);
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
  const [fruitSpawnTime, setFruitSpawnTime] = useState<number>(Date.now());
  const [timeToReachFruit, setTimeToReachFruit] = useState<number[]>([]);
  const [gameResult, setGameResult] = useState<{ result: string; message1: string; } | null>(null);
  const [topPlayers, setTopPlayers] = useState<{ user_name: string; score: number; email: string }[]>([]);
  const [currentUserScore, setCurrentUserScore] = useState<number>(0);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!loggedInUser) return;

      try {
        const leaderboardSnapshot = await firestore()
          .collection('snake_game_leadersboard')
          .orderBy('score', 'desc')
          .limit(3)
          .get();
        const topPlayersData = leaderboardSnapshot.docs.map((doc) => ({
          user_name: doc.data().user_name || 'Unknown', // Fallback if user_name is missing
          score: doc.data().score || 0,
          email: doc.id,
        }));
        setTopPlayers(topPlayersData);

        const currentUserDoc = await firestore()
          .collection('snake_game_leadersboard')
          .doc(loggedInUser)
          .get();
        if (currentUserDoc.exists) {
          const userData = currentUserDoc.data();
          setCurrentUserScore(userData?.score || 0); // Optional chaining with fallback
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, [loggedInUser]);

  // Update high score in Firestore
  const updateHighScore = async (newScore: number) => {
    if (!loggedInUser) return;

    try {
      const userRef = firestore().collection('snake_game_leadersboard').doc(loggedInUser);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        const storedScore = userData?.score || 0; // Optional chaining with fallback
        if (newScore > storedScore) {
          await userRef.update({ score: newScore });
          setCurrentUserScore(newScore);
          console.log('High score updated:', newScore);

          // Refresh leaderboard
          const leaderboardSnapshot = await firestore()
            .collection('snake_game_leadersboard')
            .orderBy('score', 'desc')
            .limit(3)
            .get();
          const updatedTopPlayers = leaderboardSnapshot.docs.map((doc) => ({
            user_name: doc.data().user_name || 'Unknown',
            score: doc.data().score || 0,
            email: doc.id,
          }));
          setTopPlayers(updatedTopPlayers);
        }
      }
    } catch (error) {
      console.error('Error updating high score:', error);
    }
  };

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

  const handleLevelSelect = (selectedLevel: number) => {
    setLevel(selectedLevel);
    setIsLevelSelected(true);
    initializeWrongFruits(selectedLevel * 2);
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
    if (
      newFoodPosition.x >= GAME_BOUNDS.xMin &&
      newFoodPosition.x <= GAME_BOUNDS.xMax &&
      newFoodPosition.y >= GAME_BOUNDS.yMin &&
      newFoodPosition.y <= GAME_BOUNDS.yMax
    ) {
      setFood(newFoodPosition);
      setRightFruitEmoji(getRandomFruitEmoji());
      setFruitSpawnTime(Date.now());
    } else {
      spawnNewFood();
    }
  };

  const moveSnake = () => {
    const snakeHead = snake[0];
    const newHead: Coordinate = { ...snakeHead };

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

    if (checkGameOver(newHead, GAME_BOUNDS)) {
      setIsGameOver(true);
      return;
    }

    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      setIsGameOver(true);
      return;
    }

    const hasEatenWrongFruit = wrongFruits.some(
      (fruit) => fruit.x === newHead.x && fruit.y === newHead.y
    );
    if (hasEatenWrongFruit) {
      setIsGameOver(true);
      return;
    }

    const tolerance = 2;
    if (Math.abs(newHead.x - food.x) <= tolerance && Math.abs(newHead.y - food.y) <= tolerance) {
      const timeTaken = (Date.now() - fruitSpawnTime) / 1000;
      setTimeToReachFruit(prev => [...prev, timeTaken]);
      spawnNewFood();
      setSnake([newHead, ...snake]);
      setScore(prevScore => prevScore + SCORE_INCREMENT);
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
    setWrongFruits([]);
    setIsGameOver(false);
    setScore(0);
    setDirection(Direction.Right);
    setIsPaused(false);
    setRightFruitEmoji(getRandomFruitEmoji());
    setTimeToReachFruit([]);
    setFruitSpawnTime(Date.now());
    setGameResult(null);
  };

  const pauseGame = () => {
    setIsPaused(!isPaused);
  };

  // Update game result and high score on game over
  useEffect(() => {
    if (isGameOver) {
      const averageSpeed = timeToReachFruit.length > 0 
        ? timeToReachFruit.reduce((a, b) => a + b, 0) / timeToReachFruit.length 
        : 0;

      console.log(`Level: ${level}, Average Speed: ${averageSpeed}, Score: ${score}`);

      let result;
      if (averageSpeed === 0) {
        result = gameResults.find(record => 
          record.level === level && record.result === "Low"
        );
      } else {
        result = gameResults.find(record => 
          record.level === level && 
          averageSpeed >= record.rangemin && 
          averageSpeed <= record.rangemax
        );
      }

      if (result) {
        setGameResult({
          result: result.result,
          message1: result.message1,
        });
        console.log(`Game Result: ${result.result}, Message: ${result.message1}`);
      } else {
        setGameResult({
          result: "Unknown",
          message1: "No matching performance range found.",
        });
        console.log("No matching result found in game_result.json");
      }

      // Update high score when game ends
      updateHighScore(score);
    }
  }, [isGameOver, score]);

  if (!isLevelSelected) {
    return (
      <ScrollView contentContainerStyle={styles.levelSelectionContainer}>
        {/* Leaderboard Section */}
        <View style={styles.leaderboardContainer}>
          <Text style={styles.leaderboardHeader}>Leaderboard</Text>
          {topPlayers.map((player, index) => (
            <View key={index} style={styles.leaderboardItem}>
              <Text style={styles.leaderboardText}>
                {index + 1}. {player.user_name}: <Text style={styles.scoreText}>{player.score}</Text>
              </Text>
            </View>
          ))}
          <View style={styles.currentUserItem}>
            <Text style={styles.leaderboardText}>
              You: <Text style={styles.currentUserScore}>{currentUserScore}</Text>
            </Text>
          </View>
        </View>

        {/* Level Selection */}
        <Text style={styles.levelHeader}>Select Levels</Text>
        {[1, 2, 3, 4, 5].map((lvl) => (
          <TouchableOpacity
            key={lvl}
            style={styles.levelButton}
            onPress={() => handleLevelSelect(lvl)}
          >
            <Text style={styles.levelText}>Level {lvl}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          {isGameOver && (
            <View style={styles.gameOverOverlay}>
              <Text style={styles.gameOverText}>Game Over</Text>
              <Text style={styles.gameOverScore}>Score: {score}</Text>
              {gameResult && (
                <>
                  <Text style={styles.gameResultText}>Result: {gameResult.result}</Text>
                  <Text style={styles.gameResultMessage}>{gameResult.message1}</Text>
                </>
              )}
              <Text style={styles.gameOverInstruction} onPress={reloadGame}>
                Tap to Restart
              </Text>
            </View>
          )}
        </SafeAreaView>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  levelSelectionContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.primary,
  },
  leaderboardContainer: {
    width: '100%',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  leaderboardHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  leaderboardItem: {
    marginVertical: 5,
  },
  currentUserItem: {
    marginVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 5,
  },
  leaderboardText: {
    fontSize: 18,
    color: '#333',
  },
  scoreText: {
    fontWeight: 'bold',
    color: '#27ac1f', // Green for top players
  },
  currentUserScore: {
    fontWeight: 'bold',
    color: '#ff4500', // Orange-red for current user
  },
  levelHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#fff',
  },
  levelButton: {
    backgroundColor: '#85fe78',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 20,
    color: '#12181e',
    fontWeight: '600',
  },
  boundaries: {
    flex: 1,
    borderColor: Colors.primary,
    borderWidth: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: Colors.background,
    position: "relative",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  gameOverOverlay: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  gameOverText: {
    fontSize: 32,
    color: "#fff",
    marginBottom: 10,
  },
  gameOverScore: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 10,
  },
  gameResultText: {
    fontSize: 20,
    color: "#85fe78",
    marginBottom: 10,
  },
  gameResultMessage: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  gameOverInstruction: {
    fontSize: 18,
    color: "#fff",
    textDecorationLine: "underline",
  },
});