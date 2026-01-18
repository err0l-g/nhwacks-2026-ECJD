import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { getLiveStatus, getTripsByRouteAndStop } from './api/api-helper.js';
import { getAllTransitData } from './api/live-data-api.js';
import { Animated, Dimensions } from 'react-native';
import Home from './src/screens/Home';
import Add from './src/screens/Add';

export default function App() {
  const [busPositions, setBusPosition] = useState(null);
  const [tripUpdates, setTripUpdates] = useState(null);
  const [serviceAlerts, setServiceAlerts] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('Home');

  const SCREEN_HEIGHT = Dimensions.get('window').height;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const [loading, setLoading] = useState(true);

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
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#121212'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20
  },
  subTitle: {
    color: '#888',
    marginTop: 20,
    marginBottom: 5,
    fontSize: 14,
    textTransform: 'uppercase'
  },
  testCard: {
    backgroundColor: '#252525',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#c3ff00',
  },
  cardHeader: {
    color: '#888',
    fontSize: 12,
    marginBottom: 10
  },
  resultText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5
  },
  alertDetail: {
    color: '#00c3ff',
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic'
  },
  jsonScroll: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 10,
    marginTop: 10
  },
  alertText: {
    color: '#00c3ff',
    fontFamily: 'monospace',
    fontSize: 11,
    marginTop: 20
  },
  alertText: {
    color: '#c3ff00',
    fontFamily: 'monospace',
    fontSize: 12,
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