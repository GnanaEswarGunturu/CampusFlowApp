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
    StatusScreen
} from './src/screens/StateScreens';

export default function App() {
    const [state, send] = useMachine(attendanceMachine);

    // Transition handling / Side effects
    useEffect(() => {
        if (state.matches('CAPTURING')) {
            handleHardwareScan();
        } else if (state.matches('PROCESSING')) {
            handleProcessing();
        }
    }, [state.value]);

    const handleHardwareScan = async () => {
        try {
            await hardwareService.startRotationScan();
            send({ type: 'HARDWARE_SCAN_COMPLETE' });
        } catch (error) {
            send({ type: 'FAILURE', error: error.message });
        }
    };

    const handleProcessing = async () => {
        try {
            const results = await faceProcessor.processFrame('mock_data');
            send({ type: 'FACE_RECOGNITION_COMPLETE', results });
        } catch (error) {
            send({ type: 'FAILURE', error: error.message });
        }
    };

    const handleSubmit = async (finalData) => {
        send({ type: 'SUBMIT' });
        try {
            // Simulate Backend Call
            setTimeout(async () => {
                const isOnline = Math.random() > 0.3; // 70% online success
                if (isOnline) {
                    send({ type: 'SUCCESS' });
                } else {
                    await OfflineQueue.enqueue(finalData);
                    send({ type: 'OFFLINE' });
                }
            }, 2000);
        } catch (error) {
            send({ type: 'FAILURE' });
        }
    };

    const renderCurrentState = () => {
        switch (state.value) {
            case 'IDLE':
                return <IdleScreen onStart={() => send({ type: 'START_ATTENDANCE' })} />;

            case 'SESSION_RESOLVED':
                return (
                    <SessionScreen
                        session={state.context.currentSession}
                        onConfirm={() => send({ type: 'CONFIRM' })}
                        onRetry={() => send({ type: 'RETRY' })}
                    />
                );

            case 'READY_TO_CAPTURE':
                return <ReadyScreen onStartHardware={() => send({ type: 'START_HARDWARE_SCAN' })} />;

            case 'CAPTURING':
                return <CapturingScreen />;

            case 'PROCESSING':
                return <ProcessingScreen />;

            case 'REVIEW_PENDING':
                // Note: In real app, we'd pass results from context
                const mockResults = [
                    { id: 'ST001', name: 'Alice' },
                    { id: 'ST005', name: 'Bob' },
                    { id: 'ST012', name: 'Charlie' }
                ];
                return (
                    <ReviewScreen
                        results={mockResults}
                        onSubmit={handleSubmit}
                        onRetake={() => send({ type: 'RETAKE' })}
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
                    <StatusScreen
                        title="Attendance Completed"
                        subtitle="Success! All records have been synchronized."
                        icon="✅"
                        buttonText="Finish"
                        onButtonPress={() => send({ type: 'RESET' })}
                        color="#10b981"
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
            {renderCurrentState()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
});
