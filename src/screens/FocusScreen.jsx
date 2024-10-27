import React from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';

export default function FocusScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
      
      
      {/* <View style={styles.topButtons}>

            <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
                <Text
                style={{fontSize: 15,
                    fontWeight: 600,
                    color: '#12181e',   
                    padding: 10,
                    margin: 5,
                    backgroundColor: '#85fe78',
                    borderRadius: 10,
                            
                }}
                >Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
                <Text
                style={{fontSize: 15,
                    fontWeight: 600,
                    color: '#12181e',   
                    padding: 10,
                    margin: 5,
                    backgroundColor: '#bcbcbc',
                    borderRadius: 10,
                            
                }}
                > Back </Text>
            </TouchableOpacity>
        </View> */}
        
        <Text>Focus screen</Text>
    </View>
  );

}
const styles = StyleSheet.create({
  topButtons: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      gap: 200,
      position: 'absolute',
      top:20,    
      }
})
