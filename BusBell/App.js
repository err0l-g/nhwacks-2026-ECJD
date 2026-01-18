import { useState, useEffect, useRef} from 'react';
import { StyleSheet, View, Animated, Dimensions, Alert } from 'react-native';
import { getLiveStatus, getTripsByRouteAndStop } from './api/api-helper.js';
import {
  initDatabase,
  getAlarms,
  insertAlarm,
  updateAlarmStatus,
  updateAlarm,
  deleteAlarm
} from './src/db/local-db-helper';
import {testConnection, getTripsByRoute, getRoutesByStopCode, getTripsByRouteShortName } from './src/db/gtfs_static_db_helper.js'

import Home from './src/screens/Home';
import Add from './src/screens/Add';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [alarms, setAlarms] = useState([]);
  const [editingAlarm, setEditingAlarm] = useState(null);

  const SCREEN_HEIGHT = Dimensions.get('window').height;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { updates, alerts } = await getAllTransitData();
        console.log("tripupdates: ",JSON.stringify(updates.slice(0, 3), null,2));
        console.log("service alerts: ", JSON.stringify(alerts.slice(0, 3), null,2));
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

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: currentScreen === 'Add' ? 100 : SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentScreen]);

  return (
      <View style={{ flex: 1, opacity: currentScreen === 'Add' ? 0.5 : 1 }}>
        <Home
          onAddPress={handleAddPress}
          alarms={alarms}
          onToggleAlarm={handleToggle}
          onPressCard={handleEditPress}
        />
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
  alertText: {
    color: '#00c3ff',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  alertText: {
    color: '#c3ff00',
    fontFamily: 'monospace',
    fontSize: 12,
  }
});