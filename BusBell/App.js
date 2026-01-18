import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Home from './src/screens/Home';
import Add from './src/screens/Add';

const STORAGE_KEY = '@alarms_list';

export default function App() {
  const [busPositions, setBusPosition] = useState(null);
  const [tripUpdates, setTripUpdates] = useState(null);
  const [serviceAlerts, setServiceAlerts] = useState(null);
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