import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, Alert } from 'react-native';
import Home from './src/screens/Home';
import Add from './src/screens/Add';
import {
  initDatabase,
  getAlarms,
  insertAlarm,
  updateAlarmStatus,
  updateAlarm,
  deleteAlarm
} from './src/db/local-db-helper';

export default function App() { 
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [alarms, setAlarms] = useState([]);
  const [editingAlarm, setEditingAlarm] = useState(null);

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

  const handleEditPress = (alarm) => {
    setEditingAlarm(alarm);
    setCurrentScreen('Add'); // Slide the modal up
  };

  const handleAddPress = () => {
    setEditingAlarm(null); // Ensure form is empty
    setCurrentScreen('Add');
  };

  const handleDelete = async (id) => {
    await deleteAlarm(id);
    const updated = await getAlarms();
    setAlarms(updated);
    setCurrentScreen('Home');
  };

  const saveAlarm = async (alarmData) => {
    try {
      if (editingAlarm) {
        await updateAlarm(alarmData.id, alarmData);
      } else {
        await insertAlarm({
          ...alarmData,
          isEnabled: true
        });
      }

      const updatedAlarms = await getAlarms();
      setAlarms(updatedAlarms);
      setEditingAlarm(null); // Clear editing state
      setCurrentScreen('Home');
    } catch (e) {
      Alert.alert("Error", "Failed to save alarm");
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

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: currentScreen === 'Add' ? 100 : SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentScreen]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ flex: 1, opacity: currentScreen === 'Add' ? 0.5 : 1 }}>
        <Home
          onAddPress={handleAddPress}
          alarms={alarms}
          onToggleAlarm={handleToggle}
          onPressCard={handleEditPress}
        />
      </View>

      <Animated.View style={[
        styles.animatedModal,
        { transform: [{ translateY: slideAnim }] }
      ]}>
        <Add
          key={editingAlarm ? `edit-${editingAlarm.id}` : 'new-alarm'}
          initialData={editingAlarm}
          onBack={() => setCurrentScreen('Home')}
          onSave={saveAlarm}
          onDelete={handleDelete}
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