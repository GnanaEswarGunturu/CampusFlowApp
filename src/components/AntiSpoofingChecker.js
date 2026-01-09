import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export const AntiSpoofingChecker = ({ blinkProb, headAngle, onPassed }) => {
    const [blinkStatus, setBlinkStatus] = useState('pending'); // pending, passed
    const [headStatus, setHeadStatus] = useState('pending');

    // Animation refs
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Simple heuristic rules
        if (blinkStatus === 'pending' && blinkProb < 0.2) { // Blink detected (eyes closed)
            setBlinkStatus('passed');
        }

        if (headStatus === 'pending' && Math.abs(headAngle) > 10) { // Head turned > 10 degrees
            setHeadStatus('passed');
        }

        if (blinkStatus === 'passed' && headStatus === 'passed') {
            onPassed();
        }
    }, [blinkProb, headAngle]);

    return (
        <View style={styles.container}>
            <View style={styles.checkRow}>
                <Text style={styles.icon}>{blinkStatus === 'passed' ? '✅' : '👁️'}</Text>
                <Text style={[styles.text, blinkStatus === 'passed' && styles.passedText]}>
                    {blinkStatus === 'passed' ? 'Blink Verified' : 'Please Blink'}
                </Text>
            </View>
            <View style={styles.checkRow}>
                <Text style={styles.icon}>{headStatus === 'passed' ? '✅' : '🔄'}</Text>
                <Text style={[styles.text, headStatus === 'passed' && styles.passedText]}>
                    {headStatus === 'passed' ? 'Movement Verified' : 'Turn Head Slightly'}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { position: 'absolute', top: 50, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', padding: 15, borderRadius: 12 },
    checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    icon: { fontSize: 20, marginRight: 10 },
    text: { color: 'white', fontWeight: '600' },
    passedText: { color: '#4ade80' }
});
