import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { getLiveStatus, getTripsByRouteAndStop } from './api/api-helper.js';
import { getAllTransitData } from './api/live-data-api.js';
import {testConnection, getTripsByRoute, getRoutesByStopCode, getTripsByRouteShortName } from './src/db/gtfs_static_db_helper.js'

export default function App() {
  const [loading, setLoading] = useState(true);
  const [transData, setTransData] = useState(null)

  // 2. Mock Test Data
  const TEST_STOP_ID = "30";
  const TEST_ROUTE_ID = "6612";
  const TEST_TRIP_ID = "14827782";

  const [eta, setEta] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [tripIds, setTripIds] = useState([]);

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
        <ActivityIndicator size="large" color="#00ff00" />
        <Text style={{ color: '#fff' }}>Fetching Live JSON...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BusBell Helper Test</Text>

      {/* 4. Display Helper Results */}
      <View style={styles.testCard}>
        <Text style={styles.cardHeader}>Test Case: Trip {TEST_TRIP_ID} @ Stop {TEST_STOP_ID}</Text>

        <Text style={styles.resultText}>
          Available Trips: {tripIds.join(', ') || "No Trip Found"}
        </Text>
        <Text style={styles.resultText}>
          Estimated Arrival: {eta || "No Trip Found"}
        </Text>

        <Text style={styles.resultText}>
          Active Alerts: {activeAlerts}
        </Text>

        {activeAlerts.length > 0 && (
          <Text style={styles.alertDetail}>
            {activeAlerts}
          </Text>
        )}
      </View>

      <Text style={styles.subTitle}>Raw Feed (First 2 Items)</Text>
      <ScrollView style={styles.jsonScroll}>
        <Text style={styles.tripText}>
          {transData ? JSON.stringify(transData.updates.slice(0, 2), null, 2) : "Transit Data not available"}
        </Text>
        <Text style={styles.tripText}>
          {eta ? JSON.stringify(eta, null, 2) : "Trip Update not available"}
        </Text>
        <Text style={styles.alertText}>
          {activeAlerts ? JSON.stringify(activeAlerts, null, 2) : "Service Alert not available"}
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
  tripText: {
    color: '#c3ff00',
    fontFamily: 'monospace',
    fontSize: 11,
  }
});