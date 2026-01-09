import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MOCK_CMR_DATA } from '../services/MockDataService';

export const TimetableScreen = ({ onBack }) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const schedule = MOCK_CMR_DATA.timetables.filter(t => t.day === today);

    return (
        <View style={styles.container}>
            <View style={styles.topHeader}>
                <Text style={styles.header}>Today's Schedule ({today})</Text>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backLink}>Back to Home</Text>
                </TouchableOpacity>
            </View>
            <ScrollView>
                {schedule.map((item, idx) => {
                    const classInfo = MOCK_CMR_DATA.classes.find(c => c._id === item.class_id);
                    return (
                        <View key={idx} style={styles.card}>
                            <Text style={styles.time}>{item.start_time} - {item.end_time}</Text>
                            <Text style={styles.course}>{classInfo?.subject}</Text>
                            <Text style={styles.room}>{classInfo?.department} Section {classInfo?.section}</Text>
                            <View style={styles.nowBadge}>
                                <Text style={styles.nowText}>NOW</Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
    header: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
    topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    backLink: { color: '#2563eb', fontWeight: 'bold' },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 15, elevation: 2, position: 'relative' },
    time: { fontSize: 14, color: '#2563eb', fontWeight: 'bold' },
    course: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginVertical: 5 },
    room: { fontSize: 14, color: '#64748b' },
    nowBadge: { position: 'absolute', right: 20, top: 20, backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    nowText: { color: 'white', fontSize: 10, fontWeight: 'bold' }
});
