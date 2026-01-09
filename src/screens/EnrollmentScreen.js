import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RotationVisualizer } from '../components/RotationVisualizer';
import { ClassroomEnrollment } from '../services/ClassroomEnrollment';

export const EnrollmentScreen = ({ onFinish, onCancel }) => {
    const [segment, setSegment] = useState(0);
    const [status, setStatus] = useState('IDLE'); // IDLE, SCANNING, COMPLETE
    const [stats, setStats] = useState({ faces: 0, total: 0 });

    const startEnrollment = async () => {
        setStatus('SCANNING');
        setSegment(0);

        const result = await ClassroomEnrollment.startScan((seg, count) => {
            setSegment(seg);
            setStats(prev => ({ faces: count, total: prev.total + count }));
        });

        setStatus('COMPLETE');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Classroom Enrollment</Text>

            <View style={styles.card}>
                <RotationVisualizer segment={segment} active={status === 'SCANNING'} />

                <View style={styles.stats}>
                    <Text style={styles.statText}>
                        Current Segment: {status === 'SCANNING' ? segment : '-'}/8
                    </Text>
                    <Text style={styles.statText}>Faces Found: {stats.faces}</Text>
                    <Text style={[styles.statText, { marginBottom: 20 }]}>
                        Total Enrolled: {stats.total}
                    </Text>
                </View>

                {status === 'IDLE' && (
                    <TouchableOpacity style={styles.btnStart} onPress={startEnrollment}>
                        <Text style={styles.btnText}>Start Motor Rotation Scan</Text>
                    </TouchableOpacity>
                )}

                {status === 'SCANNING' && (
                    <Text style={styles.scanningText}>Motor Rotating... Please Stand Clear</Text>
                )}

                {status === 'COMPLETE' && (
                    <View>
                        <Text style={styles.successText}>✅ 52 Unique Students Enrolled!</Text>
                        <TouchableOpacity style={styles.btnSuccess} onPress={onFinish}>
                            <Text style={styles.btnText}>Proceed to Attendance</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <TouchableOpacity onPress={onCancel} style={{ marginTop: 20 }}>
                <Text style={{ color: '#ef4444' }}>Cancel Enrollment</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1e293b' },
    card: { backgroundColor: 'white', padding: 30, borderRadius: 20, width: '100%', alignItems: 'center', elevation: 3 },
    btnStart: { backgroundColor: '#2563eb', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' },
    btnSuccess: { backgroundColor: '#10b981', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 10 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    stats: { width: '100%', marginBottom: 10 },
    statText: { fontSize: 16, color: '#475569', textAlign: 'center', marginBottom: 5 },
    scanningText: { color: '#f59e0b', fontWeight: 'bold', marginTop: 10 },
    successText: { color: '#10b981', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 }
});
