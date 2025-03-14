import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import './utils/firebaseConfig';
import DashboardScreen from './screens/Dashboard';
import ReadingScreen from './screens/ReadingScreen';
import WritingScreen from './screens/WritingScreen';
import SpeechScreen from './screens/SpeechScreen';
import FocusScreen from './screens/FocusScreen';
import R1Scanned from './screens/R1Scanned';
import R2TextSettings from './screens/R2TextSettings';
import WLevel1 from './screens/WLevel1';
import WLevel2 from './screens/WLevel2';
import WLevel3 from './screens/WLevel3';
import WLevel4 from './screens/WLevel4';
import SLevel1 from './screens/SLevel1';
import SLevel2 from './screens/SLevel2';
import SLevel3 from './screens/SLevel3';
import SLevel4 from './screens/SLevel4';
import ReadingText from './screens/ReadingText';
import ReadingChallenge from './screens/ReadingChallenge';
import LetterAnimation from './screens/LetterAnimation';

// Define navigation param lists
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Reading: undefined;
  Writing: undefined;
  Speech: undefined;
  Focus: undefined;
  'Text Reading': undefined;
  'Scanned Text': undefined;
  'Text Settings': undefined;
  'Reading Challenge': undefined;
  'Writing Letters': undefined;
  'Writing Numbers': undefined;
  'Writing Level 3': undefined;
  'Writing Level 4': undefined;
  'Speech Level 1': undefined;
  'Speech Level 2': undefined;
  'Speech Level 3': undefined;
  'Speech Level 4': undefined;
  'Say the word': undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// App Context for State Management (Moved outside and exported)
export const AppContext = React.createContext<{
  loggedInUser: string | null;
  setLoggedInUser: (user: string | null) => void;
}>({
  loggedInUser: null,
  setLoggedInUser: () => {},
});

// Login Screen
function LoginScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (setLoggedInUser: (user: string | null) => void) => {
    try {
      const usersSnapshot = await firestore()
        .collection('snake_game_leadersboard')
        .where('user_name', '==', userName)
        .get();

      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];
        const data = userDoc.data();
        if (data.password === password) {
          setLoggedInUser(data.email);
        } else {
          Alert.alert('Error', 'Invalid password');
        }
      } else {
        Alert.alert('Error', 'User name not found');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Login failed');
    }
  };

  return (
    <AppContext.Consumer>
      {({ setLoggedInUser }) => (
        <View style={styles.container}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.label}>User Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your user name"
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="none"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={() => handleLogin(setLoggedInUser)}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Need an account? Register</Text>
          </TouchableOpacity>
        </View>
      )}
    </AppContext.Consumer>
  );
}

// Register Screen
function RegisterScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Register'>) {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');

  const handleRegister = async () => {
    try {
      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum) || ageNum <= 26) {
        Alert.alert('Error', 'Age must be greater than 26');
        return;
      }

      const usersSnapshot = await firestore()
        .collection('snake_game_leadersboard')
        .where('user_name', '==', userName)
        .get();

      if (!usersSnapshot.empty) {
        Alert.alert('Error', 'User name already exists');
      } else {
        await firestore()
          .collection('snake_game_leadersboard')
          .doc(email)
          .set({
            user_name: userName,
            email,
            password,
            age: ageNum,
            score: 0,
          });
        Alert.alert('Success', 'Registered! Please log in.');
        navigation.navigate('Login');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Registration failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <Text style={styles.label}>User Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your user name"
        value={userName}
        onChangeText={setUserName}
        autoCapitalize="none"
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

// Main App
function App() {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    setInitializing(false);
  }, []);

  if (initializing) return null;

  return (
    <AppContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {loggedInUser ? (
            <>
              <Stack.Screen name="Home" component={DashboardScreen} />
              <Stack.Screen name="Reading" component={ReadingScreen} />
              <Stack.Screen name="Writing" component={WritingScreen} />
              <Stack.Screen name="Speech" component={SpeechScreen} />
              <Stack.Screen name="Focus" component={FocusScreen} />
              <Stack.Screen name="Text Reading" component={ReadingText} />
              <Stack.Screen name="Scanned Text" component={R1Scanned} />
              <Stack.Screen name="Text Settings" component={R2TextSettings} />
              <Stack.Screen name="Reading Challenge" component={ReadingChallenge} />
              <Stack.Screen name="Writing Letters" component={WLevel1} />
              <Stack.Screen name="Writing Numbers" component={WLevel2} />
              <Stack.Screen name="Writing Level 3" component={WLevel3} />
              <Stack.Screen name="Writing Level 4" component={WLevel4} />
              <Stack.Screen name="Speech Level 1" component={SLevel1} />
              <Stack.Screen name="Speech Level 2" component={SLevel2} />
              <Stack.Screen name="Speech Level 3" component={SLevel3} />
              <Stack.Screen name="Speech Level 4" component={SLevel4} />
              <Stack.Screen name="Say the word" component={LetterAnimation} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    alignSelf: 'flex-start',
    marginLeft: '10%',
    marginBottom: 5,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  link: {
    color: '#007AFF',
    marginTop: 10,
  },
});