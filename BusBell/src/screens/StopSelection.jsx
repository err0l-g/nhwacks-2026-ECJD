import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, FlatList, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { advancedSearchStops, getRoutesByStopCode } from '../db/gtfs_static_db_helper';

const ALL_STOPS = [
  { id: '51234', stopName: 'E 33 Ave @ Fraser St' },
  { id: '31829', stopName: 'Knight St @ E 31 Ave'}
];

export default function StopSelection({ onBack, onSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStop, setSelectedStop] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(null);
  const [filteredStops, setFilteredStops] = useState([])

  useEffect(() => {
    if (selectedStop) {
      setLoading(true);
      setSelectedTimeIndex(null);
      const timer = setTimeout(async () => {
        const routesStoppingHere = await getRoutesByStopCode(selectedStop.stop_code)
        console.log(routesStoppingHere)
        setSchedules(routesStoppingHere); 
        setLoading(false); 
      }, 800);
      return () => clearTimeout(timer);
    }

    const search_stops = async () => {
      console.log(searchQuery)
      const stops = await advancedSearchStops(searchQuery)
      if(stops.length >= 0)
      {
        setFilteredStops(stops) 
      }
    }
    search_stops()
  }, [selectedStop, searchQuery]);

  const handleTimeSelection = (index) => {
    setSelectedTimeIndex(index);
    console.log(schedules[index])
    const timeString = schedules[index].route_short_name;
    
    const date = new Date();
    
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(0);
    date.setMilliseconds(0);

    const result = {
      id: selectedStop.stop_id,
      stopName: selectedStop.stop_name,
      time: date
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
                  <Text style={styles.routeNumberText}>{item.routeNo}</Text>
                </View>
                <Text style={styles.rowLabel}>{item.destination}</Text>
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
              <Text style={styles.rowLabel}>{item.stopName}</Text>
              <Text style={styles.stopNumber}>#{item.id}</Text>
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