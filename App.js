import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Alert } from 'react-native';
import { useMachine } from '@xstate/react';
import { attendanceMachine } from './src/machines/AttendanceMachine';
import { hardwareService } from './src/services/HardwareService';
import { faceProcessor } from './src/services/FaceProcessor';
import { OfflineQueue } from './src/services/OfflineQueue';

import {
    IdleScreen,
    SessionScreen,
    ReadyScreen,
    CapturingScreen,
    ProcessingScreen,
    ReviewScreen,
    SuccessSignatureScreen,
    StatusScreen
} from './src/screens/StateScreens';
import { StudentPortal } from './src/screens/StudentPortal';
import { AuditTrail } from './src/screens/AuditTrail';
import { TimetableScreen } from './src/screens/Timetable';
import { MLProcessingScreen } from './src/screens/MLProcessing';
import { EnrollmentScreen } from './src/screens/EnrollmentScreen';
import { LiveScanScreen } from './src/screens/LiveScanScreen';
import { MongoDBService } from './src/services/MongoDBService';
import { View, Text, Switch, TouchableOpacity } from 'react-native';

export default function App() {
    const [state, send] = useMachine(attendanceMachine);
    const [viewMode, setViewMode] = React.useState('faculty'); // 'faculty' or 'student'
    const [connectionMode, setConnectionMode] = React.useState('MOCK'); // 'MOCK' or 'ATLAS'
    const [showAudit, setShowAudit] = React.useState(false);
    const [showTimetable, setShowTimetable] = React.useState(false);
    const [showEnrollment, setShowEnrollment] = React.useState(false);
    const [showLiveScan, setShowLiveScan] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false); // Explicit success state for Live Scan logic
    const [finalData, setFinalData] = React.useState([]);

    // Transition handling / Side effects
    useEffect(() => {
        if (state.matches('CAPTURING')) {
            handleHardwareScan();
        }
        // Processing is now handled by MLProcessingScreen component lifecycle
    }, [state.value]);

    const handleHardwareScan = async () => {
        try {
            await hardwareService.startRotationScan();
            send({ type: 'HARDWARE_SCAN_COMPLETE' });
        } catch (error) {
            console.error("[App] Hardware Scan Error:", error);
            send({ type: 'FAILURE', error: error.message });
        }
    };

    // Old handleProcessing removed - Logic moved to MLProcessingScreen


    const handleSubmit = async (attendanceData) => {
        send({ type: 'SUBMIT' });
        try {
            // Simulate Backend Call
            setTimeout(async () => {
                const isOnline = Math.random() > 0.05; // 95% online success for demo
                if (isOnline) {
                    setFinalData(attendanceData);
                    send({ type: 'SUCCESS' });
                } else {
                    await OfflineQueue.enqueue(attendanceData);
                    send({ type: 'OFFLINE' });
                }
            }, 2000);
        } catch (error) {
            console.error("[App] Submission Error:", error);
            send({ type: 'FAILURE', error: error.message });
        }
    };

    const renderCurrentState = () => {
        if (viewMode === 'student') {
            return <StudentPortal onBack={() => setViewMode('faculty')} />;
        }

        if (showAudit) {
            return <AuditTrail attendanceData={finalData} onFinish={() => setShowAudit(false)} />;
        }

        if (showTimetable) {
            return <TimetableScreen onBack={() => setShowTimetable(false)} />;
        }

        if (showEnrollment) {
            return (
                <EnrollmentScreen
                    onFinish={() => { setShowEnrollment(false); setShowLiveScan(true); }}
                    onCancel={() => setShowEnrollment(false)}
                />
            );
        }

        if (showSuccess) {
            return (
                <SuccessSignatureScreen
                    data={finalData}
                    onFinish={() => setShowSuccess(false)}
                />
            );
        }

        if (showLiveScan) {
            return (
                <LiveScanScreen
                    onSubmit={async (data) => {

                        if (!data || data.length === 0) {
                            Alert.alert("No Data", "No faces detected to submit.");
                            return;
                        }

                        // VALIDATION
                        const validStudents = data.filter(p => p.name !== 'No Face Detected');
                        console.log("✅ Valid Students to Submit:", JSON.stringify(validStudents));

                        setFinalData(validStudents);
                        setShowLiveScan(false);

                        // SUBMIT TO MONGODB
                        try {
                            for (const person of validStudents) {
                                console.log(`🚀 Sending Request for: ${person.name}`);
                                const result = await MongoDBService.markAttendance({
                                    person: person.name,
                                    confidence: person.confidence
                                });
                                console.log("🎉 Server Replied:", JSON.stringify(result));
                            }

                            setShowSuccess(true);
                            Alert.alert("SUCCESS", "Attendance saved to MongoDB Atlas!");

                        } catch (e) {
                            console.error("❌ SUBMISSION FAILED:", e);
                            const serverMsg = e.response?.data?.error || e.message;
                            Alert.alert("Submission Failed", `Error: ${serverMsg}`);
                        }
                    }}
                    onCancel={() => setShowLiveScan(false)}
                />
            );
        }


        switch (state.value) {
            case 'IDLE':
                return (
                    <IdleScreen
                        onStart={() => send({ type: 'START_ATTENDANCE' })}
                        onStudentPortal={() => setViewMode('student')}
                        onShowTimetable={() => setShowTimetable(true)}
                        onEnrollment={() => setShowEnrollment(true)}
                        onLiveScan={() => setShowLiveScan(true)}
                    />
                );

            case 'SESSION_RESOLVED':
                return (
                    <SessionScreen
                        session={state.context.currentSession}
                        onConfirm={() => send({ type: 'CONFIRM' })}
                        onRetry={() => send({ type: 'RETRY' })}
                    />
                );

            case 'READY_TO_CAPTURE':
                return (
                    <ReadyScreen
                        onStartHardware={() => send({ type: 'START_HARDWARE_SCAN' })}
                        onCancel={() => send({ type: 'CANCEL' })}
                    />
                );

            case 'CAPTURING':
                return <CapturingScreen onCancel={() => send({ type: 'CANCEL' })} />;

            case 'PROCESSING':
                // REAL ML: Instead of a fake spinner, we jump straight to the Live Camera
                // The hardware scan is done, now we verify faces.
                return (
                    <LiveScanScreen
                        onSubmit={(data) => {
                            setFinalData(data);
                            // We go to COMPLETED (Success) via our manual state trick,
                            // OR we send an event if the machine supports it.
                            // Let's use the machine flow properly:
                            send({ type: 'FACE_RECOGNITION_COMPLETE', results: data });
                        }}
                        onCancel={() => send({ type: 'CANCEL' })}
                    />
                );

            case 'REVIEW_PENDING':
                return (
                    <ReviewScreen
                        results={state.context.attendanceList || []}
                        onSubmit={(data) => {
                            // We capture the final list and move to Submitting
                            // This 'data' has the 'present' boolean toggles
                            setFinalData(data);
                            handleSubmit(data);
                        }}
                        onRetake={() => send({ type: 'RETAKE' })}
                        onCancel={() => send({ type: 'CANCEL' })}
                    />
                );

            case 'SUBMITTING':
                return (
                    <StatusScreen
                        title="Submitting..."
                        subtitle="Please wait while we sync with the server."
                        icon="☁️"
                        color="#2563eb"
                    />
                );

            case 'QUEUED':
                return (
                    <StatusScreen
                        title="Queued (Offline)"
                        subtitle="No internet connection. Attendance saved locally and will sync later."
                        icon="📥"
                        buttonText="Back to Home"
                        onButtonPress={() => send({ type: 'RESET' })}
                        color="#f59e0b"
                    />
                );

            case 'COMPLETED':
                return (
                    <SuccessSignatureScreen
                        data={finalData}
                        onFinish={() => {
                            send({ type: 'RESET' }); // Or go to Audit
                        }}
                    />
                );

            case 'FAILED':
                return (
                    <StatusScreen
                        title="Process Failed"
                        subtitle={state.context.error || "Something went wrong during the attendance process."}
                        icon="❌"
                        buttonText="Try Again"
                        onButtonPress={() => send({ type: 'RETRY' })}
                        color="#ef4444"
                    />
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.topBar}>
                <Text style={styles.modeText}>{connectionMode} MODE</Text>
                <Switch
                    value={connectionMode === 'ATLAS'}
                    onValueChange={(val) => setConnectionMode(val ? 'ATLAS' : 'MOCK')}
                />
            </View>
            {renderCurrentState()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    modeText: { fontSize: 10, fontWeight: 'bold', color: '#64748b' }
});
