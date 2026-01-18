import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { getAllTransitData } from './api/live-data-api.js';
import {testConnection, getTripsByRoute, getRoutesByStopCode, getTripsByRouteShortName } from './src/db/gtfs_static_db_helper.js'

export default function App() {
  const [tripUpdates, setTripUpdates] = useState(null);
  const [serviceAlerts, setServiceAlerts] = useState(null);

  const [loading, setLoading] = useState(true);

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
const setup = async () => {
    try {
      console.log("Testing API connection...");
      const connected = await testConnection();
      
      if (connected) {
        console.log("✅ API connected!");
        const trips = await getTripsByRoute('10232');
        console.log(`Found ${trips.length} trips`);
        console.log(trips[0]) 
        const routes = await getRoutesByStopCode(59701)
        console.log(`get routes from stop code: `)
        console.log(routes)
        const trips_from_name = await getTripsByRouteShortName(routes[0].route_short_name)
        console.log(`get trips from route name (index 0 shown)`)
        console.log(trips_from_name[0])
      }
    } catch (error) {
      console.error("Setup error:", error);
    }
  };


  setup();
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live GTFS JSON Feed</Text>

      <ScrollView style={styles.jsonScroll}>
        <Text style={styles.tripText}>
          {tripUpdates ? JSON.stringify(tripUpdates.slice(0, 3), null, 2) : "Trip Update not available"}
        </Text>
        <Text style={styles.alertText}>
          {serviceAlerts ? JSON.stringify(serviceAlerts.slice(0, 3), null, 2) : "Service Alert not available"}
        </Text>
      </ScrollView>
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
  tripText: {
    color: '#c3ff00',
    fontFamily: 'monospace',
    fontSize: 12,
  }
});