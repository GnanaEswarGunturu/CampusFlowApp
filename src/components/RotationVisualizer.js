import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export const RotationVisualizer = ({ segment, totalSegments = 8, active }) => {
    const rotationAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (active) {
            const angle = (360 / totalSegments) * segment;
            Animated.spring(rotationAnim, {
                toValue: angle,
                useNativeDriver: true,
                friction: 6
            }).start();
        }
    }, [segment, active]);

    const rotate = rotationAnim.interpolate({
        inputRange: [0, 360],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={styles.container}>
            <View style={styles.circle}>
                <Animated.View style={[styles.scanner, { transform: [{ rotate }] }]}>
                    <View style={styles.beam} />
                </Animated.View>

                {Array.from({ length: totalSegments }).map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            {
                                transform: [
                                    { rotate: `${(360 / totalSegments) * i}deg` },
                                    { translateY: -60 }
                                ],
                                backgroundColor: i < segment ? '#10b981' : '#cbd5e1'
                            }
                        ]}
                    />
                ))}
            </View>
            <Text style={styles.status}>
                Motor Position: {(360 / totalSegments) * segment}°
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', marginVertical: 20 },
    circle: { width: 150, height: 150, borderRadius: 75, borderWidth: 2, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', position: 'relative' },
    scanner: { width: '100%', height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center' },
    beam: { width: 4, height: '50%', backgroundColor: '#2563eb', position: 'absolute', top: 0, borderRadius: 2 },
    dot: { width: 10, height: 10, borderRadius: 5, position: 'absolute' },
    status: { marginTop: 15, fontSize: 12, fontWeight: 'bold', color: '#64748b', fontFamily: 'monospace' }
});
