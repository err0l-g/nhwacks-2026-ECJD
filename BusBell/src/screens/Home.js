import { StyleSheet, View, Text, TouchableOpacity, StatusBar } from 'react-native';

export default function Home({ onAddPress }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.headerContainer}>
        <Text style={styles.header}>My Alarms</Text>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No alarms set yet.</Text>
        <Text style={styles.subEmptyText}>Tap the + button to add an alarm.</Text>
      </View>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={onAddPress}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F1F3F2', // Light grey-green tint
    padding: 24 
  },
  headerContainer: {
    marginTop: 40,
    marginBottom: 40,
  },
  header: { 
    fontSize: 34, 
    fontWeight: '800', 
    color: '#2F3E46', // Dark Slate
    marginTop: 4 
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -100, 
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#52796F', // Muted Sage
  },
  subEmptyText: {
    fontSize: 14,
    color: '#84A98C', // Light Sage
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    backgroundColor: '#84A98C', // Sage Green
    width: 64,
    height: 64,
    borderRadius: 32, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#2F3E46",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: { 
    fontSize: 32, 
    color: '#FFF', 
    fontWeight: '300',
    marginTop: -2 
  }
});