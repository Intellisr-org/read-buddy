import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function R1Scanned({ navigation, route }) {
  const scannedText = route.params?.scannedText || 'No text scanned yet';
  const [letterSettings, setLetterSettings] = useState({});

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const updatedSettings = route.params?.letterSettings;
      if (updatedSettings) {
        setLetterSettings(updatedSettings);
        console.log('Updated letterSettings:', updatedSettings);
      }
    });
    return unsubscribe;
  }, [navigation, route.params]);

  // Render a line with per-character styling, preserving whole words
  const renderLine = (line) => {
    const words = line.split(' ');
    return words.map((word, wordIndex) => (
      <Text key={wordIndex} style={styles.word}>
        {word.split('').map((char, charIndex) => {
          const lowerChar = char.toLowerCase();
          const settings = letterSettings[lowerChar] || {
            fontSize: 18,
            color: 'black',
            bold: false,
          };
          return (
            <Text
              key={charIndex}
              style={{
                fontSize: settings.fontSize,
                color: settings.color,
                fontWeight: settings.bold ? 'bold' : 'normal',
              }}
            >
              {char}
            </Text>
          );
        })}
        {wordIndex < words.length - 1 && <Text> </Text>} {/* Add space between words */}
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
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.textContainer}
      >
        {renderLines(scannedText)}
      </ScrollView>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('Text Settings', { scannedText, letterSettings })
        }
      >
        <Text style={styles.positiveBtn}>Text Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    width: '100%',
  },
  textContainer: {
    padding: 10,
    alignItems: 'center',
  },
  lineContainer: {
    flexWrap: 'wrap', // Wrap at word boundaries
    marginVertical: 5,
    textAlign: 'center', // Center-align lines
  },
  word: {
    flexShrink: 0, // Prevent words from shrinking or breaking
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