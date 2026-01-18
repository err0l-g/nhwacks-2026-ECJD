import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    Animated,
    TouchableOpacity
} from 'react-native';
import DayCircles from './DayCircles';

const AlarmCard = ({ item, onToggleAlarm, onPressCard }) => {
    const animatedValue = useRef(new Animated.Value(item.isEnabled ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: item.isEnabled ? 1 : 0,
            duration: 500,
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
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onPressCard(item)}
            style={{ marginBottom: 16, borderRadius: 20, overflow: 'hidden'}}
        >
            <Animated.View style={[{ backgroundColor, opacity, padding: 20}]}>
                <View style={styles.cardHeader}>
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>{displayHour}:{displayMinute}</Text>
                        <Text style={styles.ampmText}>{ampm}</Text>
                    </View>
                    <Switch
                        trackColor={{ false: "#b1b7ac", true: "#84A98C" }}
                        thumbColor={"#FFF"}
                        onValueChange={() => onToggleAlarm(item.id)}
                        value={item.isEnabled}
                    />
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.routeText}>{item.busRoute} - {item.stopName}</Text>

                    <View style={styles.thresholdContainer}>
                        <Text style={styles.infoText}>🔔 {thresholdMinutes} minutes before</Text>
                    </View>

                    <View style={styles.cardFooter}>
                        <Text style={styles.label}>{item.label || "Alarm"}</Text>
                        <DayCircles daysString={item.days} />
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
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
        fontWeight: '500',
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
        fontWeight: '400',
    },
    daysText: {
        fontSize: 14,
        color: '#52796F',
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    label: {
        fontSize: 14,
        color: '#52796F',
        fontWeight: '500',
    }
});

export default AlarmCard;