import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Switch } from 'react-native';

const PrimaryButton = ({ title, onPress, color = '#2563eb' }) => (
    <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
        <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
);

export const IdleScreen = ({ onStart }) => (
    <View style={styles.center}>
        <Text style={styles.title}>Welcome, Professor</Text>
        <Text style={styles.subtitle}>Ready to record attendance?</Text>
        <PrimaryButton title="Start Attendance" onPress={onStart} />
    </View>
);

export const SessionScreen = ({ session, onConfirm, onRetry }) => (
    <View style={styles.center}>
        <Text style={styles.title}>Current Session</Text>
        <View style={styles.card}>
            <Text style={styles.cardText}>📚 {session?.course}</Text>
            <Text style={styles.cardText}>📍 {session?.venue}</Text>
            <Text style={styles.cardText}>🕒 {session?.time}</Text>
        </View>
        <PrimaryButton title="Confirm & Continue" onPress={onConfirm} />
        <TouchableOpacity onPress={onRetry} style={{ marginTop: 20 }}>
            <Text style={{ color: '#64748b' }}>Not my class? Retry</Text>
        </TouchableOpacity>
    </View>
);

export const ReadyScreen = ({ onStartHardware }) => (
    <View style={styles.center}>
        <Text style={styles.title}>Hardware Sync</Text>
        <Text style={styles.subtitle}>Please ensure ESP32 is powered on.</Text>
        <PrimaryButton title="Start Hardware Scan" onPress={onStartHardware} color="#059669" />
    </View>
);

export const CapturingScreen = () => (
    <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.title}>Hardware Scanning...</Text>
        <Text style={styles.subtitle}>ESP32 is rotating and capturing faces.</Text>
    </View>
);

export const ProcessingScreen = () => (
    <View style={styles.center}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.title}>On-Device AI Processing</Text>
        <Text style={styles.subtitle}>Matching faces with database...</Text>
    </View>
);

export const ReviewScreen = ({ results, onSubmit, onRetake }) => {
    const [data, setData] = useState(results.map(r => ({ ...r, present: true })));

    const toggleAttendance = (id) => {
        setData(prev => prev.map(item => item.id === id ? { ...item, present: !item.present } : item));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Attendance Review</Text>
            <FlatList
                data={data}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Text style={styles.rowText}>{item.name} ({item.id})</Text>
                        <Switch
                            value={item.present}
                            onValueChange={() => toggleAttendance(item.id)}
                            trackColor={{ false: '#cbd5e1', true: '#10b981' }}
                        />
                    </View>
                )}
            />
            <View style={styles.footer}>
                <PrimaryButton title="Submit Attendance" onPress={() => onSubmit(data)} />
                <TouchableOpacity onPress={onRetake} style={{ marginTop: 10 }}>
                    <Text style={{ textAlign: 'center', color: '#64748b' }}>Retake Scan</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export const StatusScreen = ({ title, subtitle, icon, buttonText, onButtonPress, color }) => (
    <View style={styles.center}>
        <Text style={[styles.title, { color }]}>{icon} {title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <PrimaryButton title={buttonText} onPress={onButtonPress} color={color} />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#1e293b', textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#64748b', marginBottom: 30, textAlign: 'center' },
    button: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 12, elevation: 3, width: '100%', alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 15, width: '100%', marginBottom: 30, elevation: 2 },
    cardText: { fontSize: 18, marginBottom: 10, color: '#334155' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'white', borderRadius: 10, marginBottom: 10 },
    rowText: { fontSize: 16, color: '#1e293b' },
    footer: { paddingVertical: 20 }
});
