import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DayCircles = ({ daysString }) => {
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const daysArray = (daysString || "-------").split('');

  return (
    <View style={styles.daysRow}>
      {daysArray.map((char, index) => {
        const isActive = char !== '-';
        return (
          <View
            key={index}
            style={[
              styles.dayCircle,
              isActive ? styles.dayActive : styles.dayInactive
            ]}
          >
            <Text style={[
              styles.dayCircleText,
              isActive ? styles.textActive : styles.textInactive
            ]}>
              {dayLabels[index]}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  daysRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dayCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayActive: {
    backgroundColor: '#52796F',
  },
  dayInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dayCircleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textActive: {
    color: '#FFF',
  },
  textInactive: {
    color: 'rgba(82, 121, 111, 0.3)',
  },
});

export default DayCircles;