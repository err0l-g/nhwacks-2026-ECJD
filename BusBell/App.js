import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, Alert } from 'react-native';
import Home from './src/screens/Home';
import Add from './src/screens/Add';
import { initDatabase, getAlarms, insertAlarm, updateAlarmStatus } from './src/db/local-db-helper';
const STORAGE_KEY = '@alarms_list';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [alarms, setAlarms] = useState([]);

  const SCREEN_HEIGHT = Dimensions.get('window').height;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const handleToggle = async (id) => {
    const alarmToToggle = alarms.find(alarm => alarm.id === id);
    if (!alarmToToggle) return;

    const newStatus = !alarmToToggle.isEnabled;

    setAlarms(prev => prev.map(alarm =>
      alarm.id === id ? { ...alarm, isEnabled: newStatus } : alarm
    ));

    try {
      await updateAlarmStatus(id, newStatus);
    } catch (e) {
      setAlarms(prev => prev.map(alarm =>
        alarm.id === id ? { ...alarm, isEnabled: !newStatus } : alarm
      ));
      Alert.alert("Error", "Could not sync change to database");
    }
  };


  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
        const data = await getAlarms();
        setAlarms(data);
      } catch (e) {
        Alert.alert("Error", "Failed to initialize database");
      }
    };
    setup();
  }, []);

const saveAlarm = async (newAlarm) => {
    try {
      const result = await insertAlarm({
        ...newAlarm,
        isEnabled: true
      });

      const updatedAlarms = await getAlarms();
      setAlarms(updatedAlarms);
      setCurrentScreen('Home');

      return result?.lastInsertRowId || result; 

    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save alarm");
      return null;
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
          onToggleAlarm={handleToggle}
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