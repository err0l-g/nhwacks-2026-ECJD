import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    Animated
} from 'react-native';

const AlarmCard = ({ item, onToggleAlarm }) => {
    const animatedValue = useRef(new Animated.Value(item.isEnabled ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: item.isEnabled ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [item.isEnabled]);

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#D1D1D1', '#b0c7b9'],
    });

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 1],
    });

    const [rawHour, displayMinute] = item.time.split(":");
    const hourInt = parseInt(rawHour, 10);

    const ampm = hourInt >= 12 ? 'PM' : 'AM';
    const displayHour = hourInt % 12 || 12;

    const thresholdMinutes = Math.round(item.threshold / 60000);

    return (
        <Animated.View style={[styles.card, { backgroundColor, opacity }]}>
            <View style={styles.cardHeader}>
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{displayHour}:{displayMinute}</Text>
                    <Text style={styles.ampmText}>{ampm}</Text>
                </View>
                <Switch
                    trackColor={{ false: "#b1b7ac", true: "#84A98C" }}
                    thumbColor={"#FFF"}
                    ios_backgroundColor="#CAD2C5"
                    onValueChange={() => onToggleAlarm(item.id)}
                    value={item.isEnabled}
                />
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.routeText}>
                    {item.busRoute} - {item.stopName}
                </Text>

                <View style={styles.thresholdContainer}>
                    <Text style={styles.infoText}>
                        🔔 {thresholdMinutes} minutes before
                    </Text>
                </View>

                <Text style={styles.daysText}>{item.label || "Alarm"}, {item.days}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#2F3E46",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    timeText: {
        fontSize: 40,
        fontWeight: '700',
        color: '#FFF',
    },
    ampmText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
        marginLeft: 4,
    },
    cardBody: {
        gap: 4,
    },
    routeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#354F52',
    },
    thresholdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },
    infoText: {
        fontSize: 14,
        color: '#FFF',
        fontWeight: '500',
    },
    daysText: {
        fontSize: 14,
        color: '#52796F',
        fontWeight: '500',
    }
});

export default AlarmCard;