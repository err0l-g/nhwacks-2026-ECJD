import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Home from './src/screens/Home';
import Add from './src/screens/Add';

const STORAGE_KEY = '@alarms_list';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [alarms, setAlarms] = useState(null);

  const SCREEN_HEIGHT = Dimensions.get('window').height;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    const loadAlarms = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
          setAlarms(JSON.parse(jsonValue));
        }
      } catch (e) {
        Alert.alert("Error", "Failed to load alarms");
      }
    };
    loadAlarms();
  }, []);

  const saveAlarm = async (newAlarm) => {
    try {
      const updatedAlarms = [newAlarm]; 
      
      setAlarms(updatedAlarms);
      
      const jsonValue = JSON.stringify(updatedAlarms);
      console.log(jsonValue);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
      
      setCurrentScreen('Home');
    } catch (e) {
      Alert.alert("Error", "Failed to save alarm");
    }
  };

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: currentScreen === 'Add' ? 100 : SCREEN_HEIGHT,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [currentScreen]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ flex: 1, opacity: currentScreen === 'Add' ? 0.5 : 1 }}>
        <Home 
          onAddPress={() => setCurrentScreen('Add')} 
          alarms={alarms}
        />
      </View>
      
      <Animated.View style={[
        styles.animatedModal,
        { transform: [{ translateY: slideAnim }] }
      ]}>
        <Add 
          onBack={() => setCurrentScreen('Home')} 
          onSave={saveAlarm} 
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  animatedModal: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0, top: 0,
    backgroundColor: '#F1F3F2',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
    elevation: 10,
  }
});