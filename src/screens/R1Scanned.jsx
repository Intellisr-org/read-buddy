import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { AppContext } from '../App.tsx';

export default function R1Scanned({ navigation, route }) {
  const scannedText = route.params?.scannedText || 'No text scanned yet';
  const [letterSettings, setLetterSettings] = useState({});
  const { loggedInUser } = useContext(AppContext);

  const loadSettingsFromFirestore = async () => {
    if (!loggedInUser) return;
    try {
      const userDoc = await firestore()
        .collection('snake_game_leadersboard')
        .doc(loggedInUser)
        .get();
      if (userDoc.exists) {
        const data = userDoc.data();
        if (data.textSettings) {
          setLetterSettings(data.textSettings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  useEffect(() => {
    // Initial load
    loadSettingsFromFirestore();

    // Reload settings when screen regains focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadSettingsFromFirestore(); // Fetch latest settings from Firestore
    });

    return unsubscribe;
  }, [navigation, loggedInUser]);

  // Render a line with per-character styling, preserving whole words
  const renderLine = (line) => {
    const words = line.split(' ');
    return words.map((word, wordIndex) => (
      <Text key={wordIndex} style={styles.word}>
        {word.split('').map((char, charIndex) => {
          const settings = letterSettings[char] || {
            fontSize: 16,
            color: 'black',
            bold: false,
          };
          return (
            <Text
              key={charIndex}
              style={{
                fontFamily: 'OpenDyslexic3-Regular',
                fontSize: settings.fontSize,
                color: settings.color,
                fontWeight: settings.bold ? 'bold' : 'normal',
              }}
            >
              {char}
            </Text>
          );
        })}
        {wordIndex < words.length - 1 && <Text> </Text>}
      </Text>
    ));
  };

  // Render text line by line
  const renderLines = (text) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => (
      <Text key={lineIndex} style={styles.lineContainer}>
        {renderLine(line)}
      </Text>
    ));
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.textWrapper}>{renderLines(scannedText)}</View>
      </ScrollView>
      <TouchableOpacity
        onPress={() => navigation.navigate('Text Settings', { scannedText, letterSettings })}
      >
        <Text style={styles.positiveBtn}>Text Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    width: '100%',
    flexGrow: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  textWrapper: {
    alignItems: 'center',
  },
  lineContainer: {
    flexWrap: 'wrap',
    marginVertical: 5,
    textAlign: 'center',
  },
  word: {
    flexShrink: 0,
  },
  positiveBtn: {
    fontSize: 15,
    fontWeight: '600',
    color: '#12181e',
    padding: 10,
    margin: 5,
    backgroundColor: '#85fe78',
    borderRadius: 10,
  },
});