import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { MERNBackend } from '../services/MERNBackend';

export const StudentPortal = ({ onBack }) => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        MERNBackend.getStudentStats('ST202401').then(setStats);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>CMR Student Portal</Text>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backLink}>Back to Home</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.scoreCard}>
                    <Text style={styles.overallTitle}>Overall Attendance</Text>
                    <Text style={styles.scoreValue}>82%</Text>
                    <Text style={styles.scoreDetail}>You are safe! ✅</Text>
                </View>

                <Text style={styles.sectionTitle}>Course Breakdown</Text>
                {stats.map((item, index) => (
                    <View key={index} style={styles.statRow}>
                        <View>
                            <Text style={styles.courseName}>{item.code}</Text>
                            <Text style={styles.courseStatus}>{item.status}</Text>
                        </View>
                        <Text style={[
                            styles.percent,
                            { color: item.percent < 75 ? '#ef4444' : '#10b981' }
                        ]}>
                            {item.percent}%
                        </Text>
                    </View>
                ))}

                <View style={styles.notification}>
                    <Text style={styles.notifText}>🔔 Today's CS401 attendance marked successfully.</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fdfcfe' },
    header: { padding: 20, paddingTop: 40, backgroundColor: '#2563eb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    backLink: { color: '#bfdbfe' },
    content: { padding: 20 },
    scoreCard: { backgroundColor: 'white', padding: 30, borderRadius: 20, alignItems: 'center', elevation: 4, marginBottom: 30 },
    overallTitle: { fontSize: 16, color: '#64748b' },
    scoreValue: { fontSize: 54, fontWeight: 'bold', color: '#1e3a8a', marginVertical: 10 },
    scoreDetail: { color: '#10b981', fontWeight: 'bold' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1e293b' },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 12, elevation: 1 },
    courseName: { fontSize: 18, fontWeight: 'bold', color: '#334155' },
    courseStatus: { fontSize: 12, color: '#94a3b8' },
    percent: { fontSize: 22, fontWeight: 'bold' },
    notification: { marginTop: 20, padding: 15, backgroundColor: '#eff6ff', borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#2563eb' },
    notifText: { color: '#1e40af', fontSize: 14 }
});
