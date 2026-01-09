import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Text } from 'react-native';

export const HardwareSimulator = ({ active }) => {
    const rotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (active) {
            Animated.loop(
                Animated.timing(rotation, {
                    toValue: 1,
                    duration: 4000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            rotation.stopAnimation();
        }
    }, [active]);

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.scanner, { transform: [{ rotate: spin }] }]}>
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                    <View
                        key={deg}
                        style={[
                            styles.segment,
                            { transform: [{ rotate: `${deg}deg` }, { translateY: -60 }] },
                        ]}
                    />
                ))}
                <View style={styles.centerDot} />
            </Animated.View>
            <Text style={styles.statusText}>ESP32 ROTATION ACTIVE</Text>
            <Text style={styles.angleText}>45° Increments</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', marginVertical: 40 },
    scanner: { width: 150, height: 150, justifyContent: 'center', alignItems: 'center' },
    segment: { position: 'absolute', width: 4, height: 20, backgroundColor: '#2563eb', borderRadius: 2 },
    centerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1e40af' },
    statusText: { color: '#2563eb', fontWeight: 'bold', marginTop: 20, fontSize: 16 },
    angleText: { color: '#64748b', fontSize: 12, marginTop: 4 }
});
