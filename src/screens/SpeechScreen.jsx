// import React from 'react';
// import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';

// export default function SpeechScreen({ navigation }) {
//   return (
//     <ImageBackground 
//     source={require("../assets/bg10.jpg")}
//     style={styles.container}>
//       <View style={styles.header}>        
//         <Text style={styles.title}>Try to say the word you see!</Text>
//       </View>
//       <View style={styles.buttonsContainer}>
//         {/* <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Speech Level 1')}>
//           <Text style={styles.buttonTextIcon}>1</Text>
//           <Text style={styles.buttonText}>Level</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Speech Level 2')}>
//           <Text style={styles.buttonTextIcon}>2</Text>
//           <Text style={styles.buttonText}>Level</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Speech Level 3')}>
//           <Text style={styles.buttonTextIcon}>3</Text>
//           <Text style={styles.buttonText}>Level</Text>
//         </TouchableOpacity> */}
//         <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Say the word')}>
//           {/* <Text style={styles.buttonTextIcon}>4</Text> */}
//           <Text style={styles.buttonText}>Start</Text>
//         </TouchableOpacity>
//       </View>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
//   header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal:50 },
//   logo: { width: 50, height: 50, marginRight: 10 },
//   title: { fontSize: 48, fontWeight: 'bold', color:'#12181e' },
//   buttonsContainer: { flexDirection: 'column', flexWrap: 'wrap', justifyContent: 'center' },
//   button: {
//     width: 200,
//     height: 100,
//     margin: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     flexDirection: 'row-reverse',
//     gap:12,
//     backgroundColor: '#85fe78',
//     borderRadius: 10,
//   },
//   buttonText: { color: '#12181e', textAlign: 'center', fontSize: 32 },
//   buttonTextIcon: { 
//     color: '#12181e', 
//     textAlign: 'center', 
//     fontSize: 28,
//     fontWeight: 'bold',
//     padding:5,
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     width:40,
//     height:40
//    },
// });
import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';

export default function SpeechScreen({ navigation }) {
  return (
    <ImageBackground source={require('../assets/bg10.jpg')} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Try to say the word you see!</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Say the word', { level: 1 })}
        >
          <Text style={styles.buttonTextIcon}>1</Text>
          <Text style={styles.buttonText}>Level</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Say the word', { level: 2 })}
        >
          <Text style={styles.buttonTextIcon}>2</Text>
          <Text style={styles.buttonText}>Level</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Say the word', { level: 3 })}
        >
          <Text style={styles.buttonTextIcon}>3</Text>
          <Text style={styles.buttonText}>Level</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Say the word', { level: 4 })}
        >
          <Text style={styles.buttonTextIcon}>4</Text>
          <Text style={styles.buttonText}>Level</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 50,
  },
  title: { fontSize: 48, fontWeight: 'bold', color: '#12181e' },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    width: 150,
    height: 100,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: 12,
    backgroundColor: '#85fe78',
    borderRadius: 10,
  },
  buttonText: {
    color: '#12181e',
    textAlign: 'center',
    fontSize: 32,
  },
  buttonTextIcon: {
    color: '#12181e',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
  },
});