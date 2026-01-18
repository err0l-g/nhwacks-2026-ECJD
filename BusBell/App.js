import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { Animated, Dimensions } from 'react-native';
import Home from './src/screens/Home';
import Add from './src/screens/Add';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');

  const SCREEN_HEIGHT = Dimensions.get('window').height;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

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
        <Home onAddPress={() => setCurrentScreen('Add')} />
      </View>
      
      <Animated.View style={[
        styles.animatedModal,
        { transform: [{ translateY: slideAnim }] }
      ]}>
        <Add onBack={() => setCurrentScreen('Home')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  animatedModal: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0, 
    backgroundColor: '#F1F3F2',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden'
  }
});