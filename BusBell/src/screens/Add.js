import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Add({ onBack }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconCircle}>
          <Ionicons name="close" size={22} color="#52796F" />
        </TouchableOpacity>
        
        <Text style={styles.navTitle}>New Alarm</Text>
        
        <TouchableOpacity onPress={onBack} style={[styles.iconCircle, { backgroundColor: '#84A98C' }]}>
          <Ionicons name="checkmark" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.menuGroup}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Label</Text>
            <TextInput 
              style={styles.rowInput} 
              placeholder="Morning Commute" 
              placeholderTextColor="#A3ADAE"
              textAlign="right"
            />
          </View>

          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowLabel}>Bus Stop</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.rowValue}>Select Stop </Text>
              <Ionicons name="chevron-forward" size={16} color="#84A98C" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowLabel}>Notify Me</Text>
            <Text style={[styles.rowValue, { color: '#52796F' }]}>5 mins</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.rowLabel}>Repeat</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.rowValue}>Daily </Text>
              <Ionicons name="chevron-forward" size={16} color="#84A98C" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F3F2' },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  navTitle: { fontSize: 18, fontWeight: '700', color: '#2F3E46' },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22, 
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: { paddingHorizontal: 20 },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28, 
    marginTop: 10,
    elevation: 6,
  },
  innerContainer: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F2',
  },
  rowLabel: { fontSize: 16, color: '#2F3E46', fontWeight: '500'},
  rowValue: { fontSize: 16, color: '#84A98C', fontWeight: '600'},
  rowInput: {
    fontSize: 16,
    color: '#2F3E46',
    flex: 1,
    marginLeft: 20,
    paddingVertical: 0, 
    includeFontPadding: false, // Ensures no extra space on Android
    textAlignVertical: 'center', // Centers text vertically within its container
  }
});