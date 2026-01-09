import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LiveAttendanceMatching } from '../services/LiveAttendanceMatching';

export const LiveScanScreen = ({ onSubmit, onCancel }) => {
    const [matches, setMatches] = useState([]);
    const [scanning, setScanning] = useState(true);

    const cameraRef = React.useRef(null);

    useEffect(() => {
        let active = true;

        const scanLoop = async () => {
            if (cameraRef.current) {
                try {
                    // REAL ML: Take actual snapshot
                    const photo = await cameraRef.current.takePictureAsync({
                        base64: true,
                        quality: 0.4, // Lower quality for speed
                        skipProcessing: true
                    });

                    if (photo.base64) {
                        const result = await LiveAttendanceMatching.scanFrame(photo.base64);
                        console.log("📸 ML Prediction:", JSON.stringify(result));
                        if (active) setMatches(result);
                    }
                } catch (e) {
                    console.warn("Camera capture failed", e);
                }
            }
        };

        const interval = setInterval(scanLoop, 2000); // 2 seconds delay

        // Wait for camera to mount before starting
        setTimeout(scanLoop, 1000);

        return () => { active = false; clearInterval(interval); };
    }, []);

    const [permission, requestPermission] = useCameraPermissions();

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>Camera Permission Required</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.btnSubmit}>
                    <Text style={styles.btnText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <View style={styles.matchRow}>
            <Text style={styles.matchName}>{item.name}</Text>
            <Text style={[styles.matchScore, { color: item.confidence > 0.9 ? '#10b981' : '#f59e0b' }]}>
                {(item.confidence * 100).toFixed(1)}% ✅
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.cameraView}>
                <CameraView
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    facing="back"
                />
                <View style={styles.overlay}>
                    <Text style={styles.overlayText}>Live Multi-Face Detection Active</Text>
                </View>
            </View>

            <View style={styles.resultsPanel}>
                <Text style={styles.header}>
                    Matched: {matches.length} Present
                </Text>

                <FlatList
                    data={matches}
                    keyExtractor={item => item.id || Math.random().toString()}
                    renderItem={renderItem}
                    style={styles.list}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#64748b' }}>Searching for faces...</Text>}
                />

                <TouchableOpacity style={styles.btnSubmit} onPress={() => onSubmit(matches)}>
                    <Text style={styles.btnText}>Submit Attendance</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onCancel} style={{ marginTop: 15, alignSelf: 'center' }}>
                    <Text style={{ color: '#94a3b8' }}>Cancel Scan</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    cameraView: { height: '45%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e293b' },
    cameraText: { color: '#475569', fontSize: 18 },
    overlay: { position: 'absolute', bottom: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 5 },
    overlayText: { color: '#4ade80', fontSize: 12, fontWeight: 'bold' },
    resultsPanel: { flex: 1, backgroundColor: '#f8fafc', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25 },
    header: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 15, textAlign: 'center' },
    list: { marginBottom: 20 },
    matchRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#e2e8f0' },
    matchName: { fontSize: 16, color: '#334155', fontWeight: 'bold' },
    matchScore: { fontSize: 16, fontWeight: 'bold' },
    btnSubmit: { backgroundColor: '#2563eb', padding: 15, borderRadius: 12, alignItems: 'center' },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});
