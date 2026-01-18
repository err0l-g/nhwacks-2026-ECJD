import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, ScrollView } from 'react-native';
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
        const { positions, updates, alerts } = await getAllTransitData();
        setBusPosition(positions)
        setTripUpdates(updates)
        setServiceAlerts(alerts)
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
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Fetching Live JSON...</Text>
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
    backgroundColor: '#1e1e1e'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10
  },
  jsonScroll: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
  },
  positionText: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  serviceText: {
    color: '#00c3ff',
    fontFamily: 'monospace',
    fontSize: 12,
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