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
  const [busPositions, setBusPosition] = useState(null);
  const [tripUpdates, setTripUpdates] = useState(null);
  const [serviceAlerts, setServiceAlerts] = useState(null);
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
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [currentScreen]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const availableTrips = await getTripsByRouteAndStop(TEST_STOP_ID, TEST_ROUTE_ID)
        setTripIds(availableTrips.map(t => t.tripId));
        
        const liveStatus = await getLiveStatus(TEST_STOP_ID, TEST_TRIP_ID);
        setEta(liveStatus.eta);
        setActiveAlerts(liveStatus.alerts);

        const transData = await getAllTransitData();
        setTransData(transData);
      } catch (err) {
        console.error("Failed to load buses:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00ff00" />
        <Text style={{ color: '#fff' }}>Fetching Live JSON...</Text>
      </View>
    );
  }

  // return (
  //   <View style={styles.container}>
  //     <Text style={styles.title}>Live GTFS JSON Feed</Text>

  //     <ScrollView style={styles.jsonScroll}>
  //       <Text style={styles.positionText}>
  //         {busPositions ? JSON.stringify(busPositions.slice(0, 3), null, 2) : "Bus Data not available"}
  //       </Text>
  //       <Text style={styles.alertText}>
  //         {serviceAlerts ? JSON.stringify(serviceAlerts.slice(0, 3), null, 2) : "Service Alert not available"}
  //       </Text>
  //       <Text style={styles.serviceText}>
  //         {tripUpdates ? JSON.stringify(tripUpdates.slice(0, 3), null, 2) : "Trip Update not available"}
  //       </Text>
  //     </ScrollView>
  //   </View>
  // );

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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
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