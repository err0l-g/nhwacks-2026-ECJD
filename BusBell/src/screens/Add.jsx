import { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, StatusBar, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StopSelection from './StopSelection';

export default function Add({
  onBack,
  onSave,
  initialData,
  onDelete
}) {
  const [currentView, setCurrentView] = useState('form');
  const [label, setLabel] = useState('');
  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedThreshold, setSelectedThreshold] = useState(5);
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(30);
  const [isNotifyExpanded, setIsNotifyExpanded] = useState(false);
  const notifyExpandAnim = useRef(new Animated.Value(0)).current;
  const [isRepeatExpanded, setIsRepeatExpanded] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const expandAnim = useRef(new Animated.Value(0)).current;

  const getDisplayTime = () => {
    if (!selectedStop) return 'Select Stop';
    const time = selectedStop.time;

    return typeof time === 'object' && time instanceof Date
      ? time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      : time;
  };

  const resetForm = () => {
    setLabel('');
    setSelectedStop(null);
    setSelectedThreshold(5);
    setSelectedDays([]);
    setIsRepeatExpanded(false);
    setIsNotifyExpanded(false);
    expandAnim.setValue(0);
    notifyExpandAnim.setValue(0);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Alarm",
      "Are you sure you want to remove this alarm?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(initialData.id) }
      ]
    );
  };

  const handleSave = () => {
    if (!selectedStop) return alert("Please select a stop");

    const dayChars = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const formattedDays = dayChars.map((char, i) =>
      selectedDays.includes(i) ? char : '-'
    ).join('');

    const thresholdMs = selectedThreshold * 60 * 1000;


    const alarmData = {
      id: initialData ? initialData.id : Date.now(),
      label: label || "Alarm",
      time: typeof selectedStop.time === 'object' && selectedStop.time instanceof Date
        ? selectedStop.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        : selectedStop.time,
      days: formattedDays,
      threshold: thresholdMs,
      stopID: selectedStop.id,
      stopName: selectedStop.stopName,
      busRoute: selectedStop.route,
      isEnabled: initialData ? initialData.isEnabled : true
    };

    onSave(alarmData);
    if (!initialData) resetForm();
  };

  const notifyHeight = notifyExpandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150],
  });

  const containerHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });

  const daysLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const toggleNotify = () => {
    const toValue = isNotifyExpanded ? 0 : 1;
    Animated.timing(notifyExpandAnim, { toValue, duration: 500, useNativeDriver: false }).start();
    setIsNotifyExpanded(!isNotifyExpanded);
  };

  const toggleRepeat = () => {
    const toValue = isRepeatExpanded ? 0 : 1;
    Animated.timing(expandAnim, { toValue, duration: 500, useNativeDriver: false }).start();
    setIsRepeatExpanded(!isRepeatExpanded);
  };

  const toggleDay = (index) => {
    if (selectedDays.includes(index)) {
      setSelectedDays(selectedDays.filter((i) => i !== index));
    } else {
      setSelectedDays([...selectedDays, index]);
    }
  };

  const getRepeatLabel = () => {
    if (selectedDays.length === 0) return 'Never ';
    if (selectedDays.length === 7) return 'Everyday ';
    const isWeekday = selectedDays.length === 5 && [1, 2, 3, 4, 5].every((d) => selectedDays.includes(d));
    if (isWeekday) return 'Every Weekday';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return selectedDays.sort((a, b) => a - b).map((index) => dayNames[index]).join(', ') + ' ';
  };

  useEffect(() => {
    if (initialData) {
      setLabel(String(initialData.label));

      const minutes = Math.round(initialData.threshold / 60000);
      setSelectedThreshold(minutes);

      const dayChars = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const indices = initialData.days.split('')
        .map((char, i) => (char !== '-' ? i : null))
        .filter((val) => val !== null);
      setSelectedDays(indices);

      setSelectedStop({
        id: initialData.stopID,
        stopName: initialData.stopName,
        route: initialData.busRoute,
        time: initialData.time
      });

      if (indices.length > 0) {
        setIsRepeatExpanded(true);
        expandAnim.setValue(1);
      }

      setIsNotifyExpanded(false);
      notifyExpandAnim.setValue(0);

    } else {
      resetForm();
    }
  }, [initialData]);

  if (currentView === 'stops') {
    return (
      <StopSelection
        onSelect={(selection) => {
          setSelectedStop(selection);
          setCurrentView('form');
        }}
        onBack={() => setCurrentView('form')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => {  onBack(); }} style={styles.iconCircle}>
          <Ionicons name="close" size={22} color="#52796F" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{initialData ? 'Edit Alarm' : 'New Alarm'}</Text>
        <TouchableOpacity onPress={handleSave} style={[styles.iconCircle, { backgroundColor: '#84A98C' }]}>
          <Ionicons name="checkmark" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.menuGroup}>
          <View style={[styles.row, { paddingVertical: 10 }]}>
            <Text style={styles.rowLabel}>Label</Text>
            <TextInput
              style={styles.rowInput}
              placeholder="Alarm"
              textAlign="right"
              value={label}
              onChangeText={setLabel}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={() => setCurrentView('stops')}>
            <Text style={[ styles.rowLabel, { paddingVertical: 20 }]}>Bus Stop</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.rowValue}>
                {selectedStop
                  ? `${getDisplayTime()} - ${selectedStop.stopName}`
                  : 'Select Stop'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#84A98C" />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={toggleNotify}>
            <Text style={[ styles.rowLabel, { paddingVertical: 20 }]}>Bus Arrival Approximate Time</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.rowValue}>{String(selectedHour).padStart(2, "0")}:{String(selectedMinute).padStart(2, "0")}</Text>
              <Ionicons name={isNotifyExpanded ? 'chevron-down' : 'chevron-forward'} size={16} color="#84A98C" />
            </View>
          </TouchableOpacity>

          <Animated.View style={{ height: notifyHeight, overflow: 'hidden', flexDirection: 'row' }}>
            <ScrollView nestedScrollEnabled={true} style={{ backgroundColor: '#F9FAFA' }}>
              {Array.from({ length: 24 }, (_, i) => i + 1).map((hour) => (
                <TouchableOpacity
                  key={hour}
                  style={styles.verticalOptionSimple}
                  onPress={() => {
                     setSelectedHour(hour); toggleNotify(); 
                    }}
                >
                  <Text style={[styles.minText, selectedHour === hour && { color: '#84A98C', fontWeight: '800' }]}>
                    {hour}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <ScrollView nestedScrollEnabled={true} style={{ backgroundColor: '#F9FAFA' }}>
              {Array.from({ length: 60 }, (_, i) => i + 1).map((min) => (
                <TouchableOpacity
                  key={min}
                  style={styles.verticalOptionSimple}
                  onPress={() => { setSelectedMinute(min); toggleNotify(); }}
                >
                  <Text style={[styles.minText, selectedMinute === min && { color: '#84A98C', fontWeight: '800' }]}>
                    {min}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
          
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={toggleNotify}>
            <Text style={[ styles.rowLabel, { paddingVertical: 20 }]}>Notify Me Before</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.rowValue}>{selectedThreshold} minutes</Text>
              <Ionicons name={isNotifyExpanded ? 'chevron-down' : 'chevron-forward'} size={16} color="#84A98C" />
            </View>
          </TouchableOpacity>

          <Animated.View style={{ height: notifyHeight, overflow: 'hidden' }}>
            <ScrollView nestedScrollEnabled={true} style={{ backgroundColor: '#F9FAFA' }}>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((min) => (
                <TouchableOpacity
                  key={min}
                  style={styles.verticalOptionSimple}
                  onPress={() => { setSelectedThreshold(min); toggleNotify(); }}
                >
                  <Text style={[styles.minText, selectedThreshold === min && { color: '#84A98C', fontWeight: '800' }]}>
                    {min} {min === 1 ? 'minute' : 'minutes'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          <View style={styles.divider} />

          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={toggleRepeat}>
            <Text style={[ styles.rowLabel, { paddingVertical: 20 }]}>Repeat</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.rowValue}>{getRepeatLabel()}</Text>
              <Ionicons name={isRepeatExpanded ? 'chevron-down' : 'chevron-forward'} size={16} color="#84A98C" />
            </View>
          </TouchableOpacity>

          <Animated.View style={{ height: containerHeight, overflow: 'hidden' }}>
            <View style={styles.daysContainer}>
              {daysLabels.map((day, index) => {
                const isSelected = selectedDays.includes(index);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.dayCircle, isSelected && styles.dayCircleSelected]}
                    onPress={() => toggleDay(index)}
                  >
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </View>

        {initialData && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete Alarm</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F1F3F2' 
  },
  navBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 40, 
    paddingHorizontal: 20, 
    paddingBottom: 20 
  },
  navTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#2F3E46' 
  },
  iconCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#FFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 2 
  },
  scrollContent: { 
    paddingHorizontal: 20 
  },
  menuGroup: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 28, 
    marginTop: 10, 
    elevation: 6 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 18 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#E0E4E2', 
    marginHorizontal: 12 
  },
  rowLabel: { 
    fontSize: 16, 
    color: '#2F3E46', 
    fontWeight: '500' 
  },
  rowValue: { 
    fontSize: 16, 
    color: '#84A98C', 
    fontWeight: '600' 
  },
  rowInput: { 
    fontSize: 16, 
    color: '#2F3E46', 
    flex: 1, 
    marginLeft: 20, 
    textAlign: 'right'
  },
  daysContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingBottom: 20 
  },
  dayCircle: { 
    width: 35, 
    height: 35, 
    borderRadius: 18, 
    borderWidth: 1, 
    borderColor: '#84A98C', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  dayCircleSelected: { 
    backgroundColor: '#84A98C' 
  },
  dayText: { 
    color: '#84A98C', 
    fontWeight: '600', 
    fontSize: 12 
  },
  dayTextSelected: { 
    color: '#FFF' 
  },
  verticalOptionSimple: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 12 
  },
  minText: { 
    color: '#A0A0A0', 
    fontSize: 16 
  },
  deleteButton: { 
    backgroundColor: '#FFF', 
    marginTop: 30, 
    paddingVertical: 18, 
    borderRadius: 24, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#FF6B6B', 
    marginBottom: 40,
    elevation: 4
  },
  deleteText: { 
    color: '#FF6B6B', 
    fontSize: 16, 
    fontWeight: '700' 
  }
});