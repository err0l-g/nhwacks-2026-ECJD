import { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, StatusBar, Animated,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Add({ onBack }) {
  const [isRepeatExpanded, setIsRepeatExpanded] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);

  const expandAnim = useRef(new Animated.Value(0)).current;

  const containerHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const toggleRepeat = () => {
    const toValue = isRepeatExpanded ? 0 : 1;

    Animated.timing(expandAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();

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

    const isWeekday =
      selectedDays.length === 5 &&
      [1, 2, 3, 4, 5].every((d) => selectedDays.includes(d));

    if (isWeekday) return 'Every Weekday';

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      selectedDays
        .sort((a, b) => a - b)
        .map((index) => dayNames[index])
        .join(', ') + ' '
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* NAV BAR */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconCircle}>
          <Ionicons name="close" size={22} color="#52796F" />
        </TouchableOpacity>

        <Text style={styles.navTitle}>New Alarm</Text>

        <TouchableOpacity
          onPress={onBack}
          style={[styles.iconCircle, { backgroundColor: '#84A98C' }]}
        >
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
              textAlign="right"
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowLabel}>Bus Stop</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.rowValue}>Select Stop </Text>
              <Ionicons name="chevron-forward" size={16} color="#84A98C" />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowLabel}>Notify Me</Text>
            <Text style={[styles.rowValue, { color: '#52796F' }]}>
              5 mins
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.row, { borderBottomWidth: 0 }]}
            onPress={toggleRepeat}
          >
            <Text style={styles.rowLabel}>Repeat</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.rowValue}>{getRepeatLabel()}</Text>
              <Ionicons
                name={isRepeatExpanded ? 'chevron-down' : 'chevron-forward'}
                size={16}
                color="#84A98C"
              />
            </View>
          </TouchableOpacity>

          <Animated.View
            style={{ height: containerHeight, overflow: 'hidden' }}
          >
            <View style={styles.daysContainer}>
              {days.map((day, index) => {
                const isSelected = selectedDays.includes(index);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCircle,
                      isSelected && styles.dayCircleSelected,
                    ]}
                    onPress={() => toggleDay(index)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F3F2',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F3E46',
  },
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
  scrollContent: {
    paddingHorizontal: 20,
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    marginTop: 10,
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E4E2',
    marginHorizontal: 12,
  },
  rowLabel: {
    fontSize: 16,
    color: '#2F3E46',
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 16,
    color: '#84A98C',
    fontWeight: '600',
  },
  rowInput: {
    fontSize: 16,
    color: '#2F3E46',
    flex: 1,
    marginLeft: 20,
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dayCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#84A98C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleSelected: {
    backgroundColor: '#84A98C',
  },
  dayText: {
    color: '#84A98C',
    fontWeight: '600',
    fontSize: 12,
  },
  dayTextSelected: {
    color: '#FFF',
  },
});
