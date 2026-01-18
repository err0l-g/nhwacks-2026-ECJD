import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, FlatList, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { advancedSearchStops, getRoutesByStopCode } from '../db/gtfs_static_db_helper';

export default function StopSelection({ onBack, onSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStop, setSelectedStop] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(null);
  const [filteredStops, setFilteredStops] = useState([])

  useEffect(() => {
    const getSelectionData = async () => {
      if (selectedStop) {
        setLoading(true);
        setSelectedTimeIndex(null);
        try {
          const routesStoppingHere = await getRoutesByStopCode(selectedStop.stop_code);
          setRoutes(routesStoppingHere || []);
        } catch (error) {
          console.error("Fetch Routes Error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        try {
          const stops = await advancedSearchStops(searchQuery);
          setFilteredStops(stops || []);
        } catch (error) {
          console.error("Search Stops Error:", error);
        }
      }
    };

    getSelectionData();
  }, [selectedStop, searchQuery]);

  const handleRouteSelection = (item) => {
    const result = {
      id: selectedStop.stop_id,
      stopName: selectedStop.stop_name,
      route: item.route_short_name,
      route_id: item.route_id
    };
    onSelect(result);
  };

  if (selectedStop) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedStop(null)} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#2F3E46" />
          </TouchableOpacity>
          <Text style={[styles.rowLabel, { flex: 1 }]} numberOfLines={1}>
            {selectedStop.stop_name}
          </Text>
        </View>

        <View style={styles.listContent}>
          <Text style={styles.sectionTitle}>Select Route for #{selectedStop.stop_id}:</Text>
          {loading ? (
            <ActivityIndicator color="#84A98C" style={{ marginTop: 20 }} />
          ) : (
            routes.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => handleRouteSelection(item)}
                style={styles.routeItem}
              >
                <View style={styles.routeIcon}>
                  <Text style={styles.routeNumberText}>{item.route_short_name}</Text>
                </View>
                <Text style={styles.rowLabel}>{item.route_long_name}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#2F3E46" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#84A98C" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stop name or #"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredStops}
        keyExtractor={(item) => item.stop_id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => setSelectedStop(item)}>
            <View>
              <Text style={styles.rowLabel}>{item.stop_name}</Text>
              <Text style={styles.stopNumber}>#{item.stop_id}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#84A98C" />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F3F2' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
  },
  backButton: { marginRight: 15 },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    paddingHorizontal: 12,
    backgroundColor: '#F1F3F2',
    borderRadius: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#2F3E46' },
  listContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  divider: { height: 1, backgroundColor: '#E0E4E2' },
  sectionTitle: { fontSize: 14, color: '#666', marginBottom: 15 },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#FFF',
    borderRadius: 15,
    elevation: 2,
  },
  routeIcon: {
    backgroundColor: '#84A98C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 15,
  },
  routeNumberText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  rowLabel: { fontSize: 16, fontWeight: '600', color: '#2F3E46' },
  stopNumber: { fontSize: 13, color: '#84A98C', marginTop: 3 },
});