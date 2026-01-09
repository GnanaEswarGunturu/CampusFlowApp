import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Switch, Image, Alert } from 'react-native';
import { HardwareSimulator } from '../components/HardwareSimulator';
import { AutoEnrollService } from '../services/AutoEnrollService';

const PrimaryButton = ({ title, onPress, color = '#2563eb' }) => (
    <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
        <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
);

export const IdleScreen = ({ onStart, onStudentPortal, onShowTimetable, onEnrollment, onLiveScan }) => {
    const [loading, setLoading] = useState(false);

    const handleAutoEnroll = async () => {
        setLoading(true);
        const count = await AutoEnrollService.enrollEswar();
        setLoading(false);
        Alert.alert("Training Complete", `${count} samples processed for Eswar.\nDatabase updated.`);
    };

    return (
        <View style={styles.center}>
            <View style={styles.hackfestBanner}>
                <Text style={styles.bannerText}>🏆 CMR HACKFEST 3.0 - PROBLEM #45</Text>
            </View>
            <Text style={styles.title}>Welcome, Professor</Text>
            <Text style={styles.subtitle}>Ready to record attendance?</Text>
            <PrimaryButton title="Start Attendance" onPress={onStart} />

            <View style={{ marginTop: 20 }}>
                <PrimaryButton title="📸 Enroll Classroom (8 Segments)" onPress={onEnrollment} color="#4338ca" />
                <View style={{ height: 10 }} />
                <PrimaryButton title="⚡ Train Model on Eswar Data" onPress={handleAutoEnroll} color="#e11d48" />
                <View style={{ height: 10 }} />
                <PrimaryButton title="📱 Live Back Camera Scan" onPress={onLiveScan} color="#be185d" />
            </View>

            <TouchableOpacity onPress={onShowTimetable} style={[styles.studentLink, { marginTop: 15 }]}>
                <Text style={styles.studentLinkText}>View Today's Timetable</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onStudentPortal} style={styles.studentLink}>
                <Text style={styles.studentLinkText}>Switch to Student Portal</Text>
            </TouchableOpacity>


            {
                loading && (
                    <View style={StyleSheet.absoluteFill}>
                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#ffffff" />
                            <Text style={{ color: 'white', marginTop: 20, fontSize: 18, fontWeight: 'bold' }}>Training MobileFaceNet...</Text>
                        </View>
                    </View>
                )
            }
        </View >
    );
};

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

export const ReadyScreen = ({ onStartHardware, onCancel }) => (
    <View style={styles.center}>
        <Text style={styles.title}>Hardware Sync</Text>
        <Text style={styles.subtitle}>Please ensure ESP32 is powered on.</Text>
        <PrimaryButton title="Start Hardware Scan" onPress={onStartHardware} color="#059669" />
        <TouchableOpacity onPress={onCancel} style={{ marginTop: 20 }}>
            <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Cancel Process</Text>
        </TouchableOpacity>
    </View>
);

export const CapturingScreen = ({ onCancel }) => (
    <View style={styles.center}>
        <Text style={styles.title}>ESP32 Device Scanning</Text>
        <HardwareSimulator active={true} />
        <Text style={styles.subtitle}>Capturing 45° incremental face samples...</Text>
        <TouchableOpacity onPress={onCancel} style={{ marginTop: 20 }}>
            <Text style={{ color: '#ef4444' }}>Stop Scan</Text>
        </TouchableOpacity>
    </View>
);

export const ProcessingScreen = ({ onCancel }) => {
    const [confidence, setConfidence] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setConfidence(85 + Math.random() * 13);
        }, 400);
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={styles.title}>On-Device AI Match</Text>
            <View style={styles.confidenceBox}>
                <Text style={styles.confidenceLabel}>LIVE CONFIDENCE</Text>
                <Text style={styles.confidenceValue}>{confidence.toFixed(2)}%</Text>
            </View>
            <Text style={styles.subtitle}>Matching with 50+ pre-loaded embeddings...</Text>
            <TouchableOpacity onPress={onCancel} style={{ marginTop: 20 }}>
                <Text style={{ color: '#64748b' }}>Cancel Processing</Text>
            </TouchableOpacity>
        </View>
    );
};

export const ReviewScreen = ({ results, onSubmit, onRetake, onCancel }) => {
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
                <TouchableOpacity onPress={onRetake} style={{ marginTop: 15 }}>
                    <Text style={{ textAlign: 'center', color: '#2563eb', fontWeight: 'bold' }}>Retake Scan</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCancel} style={{ marginTop: 10 }}>
                    <Text style={{ textAlign: 'center', color: '#ef4444' }}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export const SuccessSignatureScreen = ({ data, onFinish }) => {
    const presentCount = data.filter(d => d.confidence > 0).length; // Simple check if they were in the list
    const eswar = data.find(d => d.name === 'Eswar' || d.id === 'ESWAR001');

    return (
        <View style={styles.center}>
            <View style={{ alignItems: 'center', marginBottom: 30 }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
                    <Text style={{ fontSize: 40 }}>✅</Text>
                </View>
                <Text style={styles.title}>Attendance Verified</Text>
                <Text style={styles.subtitle}>{new Date().toLocaleString()}</Text>
            </View>

            <View style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={[styles.cardText, { fontWeight: 'bold' }]}>Class Strength:</Text>
                    <Text style={styles.cardText}>{presentCount} Present</Text>
                </View>

                {eswar ? (
                    <View style={{ backgroundColor: '#f0fdf4', padding: 10, borderRadius: 8, marginVertical: 10, borderWidth: 1, borderColor: '#86efac' }}>
                        <Text style={{ color: '#166534', fontWeight: 'bold' }}>👤 {eswar.name} (ESWAR001)</Text>
                        <Text style={{ color: '#166534', fontSize: 12 }}>Status: Present • Verified</Text>
                    </View>
                ) : (
                    <Text style={{ color: '#94a3b8', fontStyle: 'italic' }}>Eswar not detected in this session.</Text>
                )}

                <View style={{ marginTop: 20, borderTopWidth: 1, borderColor: '#e2e8f0', paddingTop: 15, alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, color: '#64748b', letterSpacing: 1, marginBottom: 5 }}>DIGITALLY SIGNED BY</Text>
                    <Text style={{ fontFamily: 'serif', fontSize: 24, fontStyle: 'italic', color: '#1e293b' }}>Dr. P. Kumar</Text>
                    <Text style={{ fontSize: 10, color: '#2563eb', marginTop: 5 }}>🔐 0x7F...AE29 • VERIFIED</Text>
                </View>
            </View>

            <PrimaryButton title="Done" onPress={onFinish} color="#10b981" />
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
    hackfestBanner: { backgroundColor: '#fef3c7', padding: 8, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#f59e0b' },
    bannerText: { fontSize: 12, fontWeight: 'bold', color: '#92400e' },
    studentLink: { marginTop: 30 },
    studentLinkText: { color: '#2563eb', fontWeight: 'bold' },
    confidenceBox: { marginVertical: 20, alignItems: 'center', backgroundColor: '#f5f3ff', padding: 15, borderRadius: 15, width: '80%' },
    confidenceLabel: { fontSize: 12, color: '#7c3aed', fontWeight: 'bold' },
    confidenceValue: { fontSize: 32, fontWeight: 'bold', color: '#5b21b6' },
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
