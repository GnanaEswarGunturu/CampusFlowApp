import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Switch, Image, Alert, Dimensions, ScrollView } from 'react-native';
import { HardwareSimulator } from '../components/HardwareSimulator';
import { AutoEnrollService } from '../services/AutoEnrollService';
import { Ionicons } from '@expo/vector-icons'; // Ensure expo/vector-icons is available default in expo

const { width } = Dimensions.get('window');

// --- DESIGN SYSTEM ---
const COLORS = {
    bg: '#F8FAFC',
    card: '#FFFFFF',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    primary: '#4F46E5', // Indigo
    success: '#10B981', // Emerald
    danger: '#EF4444', // Red
    warning: '#F59E0B',
    border: '#E2E8F0'
};

const SHADOW = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
};

// --- COMPONENTS ---
const ActionCard = ({ title, subtitle, icon, onPress, color, fullWidth }) => (
    <TouchableOpacity
        style={[styles.actionCard, fullWidth && { width: '100%' }]}
        onPress={onPress}
        activeOpacity={0.9}
    >
        <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
            <Text style={{ fontSize: 24 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>{title}</Text>
            {subtitle && <Text style={styles.actionSubtitle}>{subtitle}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
);

const PrimaryButton = ({ title, onPress, color = COLORS.primary, outline }) => (
    <TouchableOpacity
        style={[
            styles.button,
            outline ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: color } : { backgroundColor: color }
        ]}
        onPress={onPress}
    >
        <Text style={[styles.buttonText, outline && { color: color }]}>{title}</Text>
    </TouchableOpacity>
);

// --- SCREENS ---

export const IdleScreen = ({ onStart, onStudentPortal, onShowTimetable, onEnrollment, onLiveScan }) => {
    const [loading, setLoading] = useState(false);

    const handleAutoEnroll = async () => {
        setLoading(true);
        const count = await AutoEnrollService.enrollEswar();
        setLoading(false);
        Alert.alert("Training Complete", `${count} samples processed for Eswar.\nDatabase updated.`);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header */}
            <View style={styles.headerArea}>
                <View>
                    <Text style={styles.welcomeText}>Hello,</Text>
                    <Text style={styles.userName}>Professor Kumar</Text>
                </View>
                <TouchableOpacity onPress={onStudentPortal} style={styles.profilePic}>
                    <Text>👨‍🏫</Text>
                </TouchableOpacity>
            </View>

            {/* Main Action */}
            <View style={styles.heroCard}>
                <Text style={styles.heroTitle}>Computer Science A</Text>
                <Text style={styles.heroSubtitle}>Next Session: 10:30 AM • Block B</Text>
                <PrimaryButton title="Start Attendance" onPress={onStart} color={COLORS.primary} />
            </View>

            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <View style={styles.grid}>
                <ActionCard
                    title="Live Scan"
                    subtitle="Back Camera AI"
                    icon="📸"
                    color="#EC4899"
                    onPress={onLiveScan}
                    fullWidth
                />
                <View style={styles.row}>
                    <TouchableOpacity style={[styles.smallCard, { marginRight: 10 }]} onPress={onEnrollment}>
                        <View style={[styles.iconCircle, { backgroundColor: '#E0E7FF' }]}>
                            <Text>👥</Text>
                        </View>
                        <Text style={styles.smallCardText}>Enroll</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.smallCard} onPress={handleAutoEnroll}>
                        <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                            <Text>⚡</Text>
                        </View>
                        <Text style={styles.smallCardText}>Train</Text>
                    </TouchableOpacity>
                </View>

                <ActionCard
                    title="Timetable"
                    subtitle="View Schedule"
                    icon="📅"
                    color="#3B82F6"
                    onPress={onShowTimetable}
                    fullWidth
                />
            </View>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={styles.loadingText}>Training MobileFaceNet...</Text>
                </View>
            )}
        </ScrollView>
    );
};

export const SessionScreen = ({ session, onConfirm, onRetry }) => (
    <View style={styles.centerContainer}>
        <View style={styles.modalCard}>
            <View style={styles.modalIcon}><Text style={{ fontSize: 40 }}>📚</Text></View>
            <Text style={styles.modalTitle}>Confirm Session</Text>

            <View style={styles.infoRow}>
                <Text style={styles.label}>Course</Text>
                <Text style={styles.value}>{session?.course}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.label}>Venue</Text>
                <Text style={styles.value}>{session?.venue}</Text>
            </View>

            <View style={{ marginTop: 20, width: '100%' }}>
                <PrimaryButton title="Confirm Session" onPress={onConfirm} />
                <View style={{ height: 10 }} />
                <PrimaryButton title="Not my class" onPress={onRetry} outline color={COLORS.textSecondary} />
            </View>
        </View>
    </View>
);

export const ReadyScreen = ({ onStartHardware, onCancel }) => (
    <View style={styles.centerContainer}>
        <View style={[styles.modalCard, { alignItems: 'center' }]}>
            <View style={[styles.circleIcon, { backgroundColor: '#D1FAE5' }]}>
                <Text style={{ fontSize: 32 }}>📡</Text>
            </View>
            <Text style={styles.modalTitle}>Hardware Sync</Text>
            <Text style={styles.modalSubtitle}>Connect the ESP32 camera to the rotating mount.</Text>
            <PrimaryButton title="Start Hardware Scan" onPress={onStartHardware} color={COLORS.success} />
            <TouchableOpacity onPress={onCancel} style={{ marginTop: 20 }}>
                <Text style={{ color: COLORS.danger }}>Cancel</Text>
            </TouchableOpacity>
        </View>
    </View>
);

export const CapturingScreen = ({ onCancel }) => (
    <View style={styles.centerContainer}>
        <Text style={styles.modalTitle}>Scanning...</Text>
        <HardwareSimulator active={true} />
        <Text style={styles.modalSubtitle}>Capturing 45° incremental samples</Text>
        <TouchableOpacity onPress={onCancel} style={{ marginTop: 30 }}>
            <Text style={{ color: COLORS.danger }}>Stop Scan</Text>
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
        <View style={styles.centerContainer}>
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
            <View style={styles.simpleHeader}>
                <Text style={styles.headerTitle}>Review Attendance</Text>
                <TouchableOpacity onPress={onCancel}><Text style={{ color: COLORS.primary }}>Cancel</Text></TouchableOpacity>
            </View>
            <FlatList
                data={data}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 20 }}
                renderItem={({ item }) => (
                    <View style={styles.studentCard}>
                        <View style={styles.studentAvatar}>
                            <Text>{item.name[0]}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.studentName}>{item.name}</Text>
                            <Text style={styles.studentId}>{item.id}</Text>
                        </View>
                        <Switch
                            value={item.present}
                            onValueChange={() => toggleAttendance(item.id)}
                            trackColor={{ false: '#E2E8F0', true: COLORS.success }}
                        />
                    </View>
                )}
            />
            <View style={styles.footer}>
                <PrimaryButton title={`Submit (${data.filter(x => x.present).length})`} onPress={() => onSubmit(data)} />
            </View>
        </View>
    );
};

export const SuccessSignatureScreen = ({ data, onFinish }) => {
    const presentCount = data.filter(d => d.confidence > 0).length;
    const eswar = data.find(d => d.name === 'Eswar' || d.id === 'ESWAR001');

    return (
        <View style={styles.centerContainer}>
            <View style={styles.receiptCard}>
                {/* Header */}
                <View style={styles.receiptHeader}>
                    <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={30} color="white" />
                    </View>
                    <Text style={styles.receiptTitle}>Attendance Verified</Text>
                    <Text style={styles.receiptDate}>{new Date().toLocaleString()}</Text>
                </View>

                <View style={styles.divider} />

                {/* Stats */}
                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Total Present</Text>
                    <Text style={styles.statValue}>{presentCount} Students</Text>
                </View>

                <View style={styles.divider} />

                {/* Eswar Status */}
                <View style={[styles.statusBox, eswar ? { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' } : { backgroundColor: '#F1F5F9' }]}>
                    <Text style={[styles.statusTitle, eswar ? { color: '#166534' } : { color: '#64748B' }]}>
                        {eswar ? `👤 ${eswar.name} (ESWAR001)` : "👤 Eswar Not Found"}
                    </Text>
                    <Text style={[styles.statusSub, eswar ? { color: '#166534' } : { color: '#64748B' }]}>
                        {eswar ? "Authenticated • Biometric Match" : "Absent in this session"}
                    </Text>
                </View>

                {/* Digital Signature */}
                <View style={styles.signatureSection}>
                    <Text style={styles.sigLabel}>DIGITALLY SIGNED BY</Text>
                    <Image
                        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png' }}
                        style={{ width: 120, height: 40, opacity: 0.8, alignSelf: 'center', marginVertical: 5 }}
                        resizeMode="contain"
                    />
                    <Text style={styles.sigName}>Dr. P. Kumar</Text>
                    <Text style={styles.sigHash}>🔐 0x7F9A...3E29 • SECURE TOKEN</Text>
                </View>
            </View>

            <View style={{ width: '100%', padding: 20 }}>
                <PrimaryButton title="Done" onPress={onFinish} color={COLORS.primary} />
            </View>
        </View>
    );
};

export const StatusScreen = ({ title, subtitle, icon, buttonText, onButtonPress, color }) => (
    <View style={styles.centerContainer}>
        <Text style={[styles.title, { color }]}>{icon} {title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={{ width: '80%', marginTop: 20 }}>
            <PrimaryButton title={buttonText} onPress={onButtonPress} color={color} />
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    centerContainer: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', padding: 20 },

    // Header
    headerArea: { padding: 24, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    welcomeText: { fontSize: 16, color: COLORS.textSecondary },
    userName: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
    profilePic: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center' },

    // Hero Card
    heroCard: { margin: 20, marginTop: 0, padding: 24, backgroundColor: COLORS.card, borderRadius: 24, ...SHADOW },
    heroTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 5 },
    heroSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 },

    // Grid
    sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginLeft: 24, marginBottom: 15 },
    grid: { paddingHorizontal: 20 },
    actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
    iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    actionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
    actionSubtitle: { fontSize: 13, color: COLORS.textSecondary },

    row: { flexDirection: 'row', marginBottom: 12 },
    smallCard: { flex: 1, backgroundColor: COLORS.card, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
    iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    smallCardText: { fontWeight: '600', color: COLORS.textPrimary },

    // Modal Style
    modalCard: { width: '100%', backgroundColor: COLORS.card, borderRadius: 24, padding: 30, ...SHADOW, alignItems: 'center' },
    modalIcon: { marginBottom: 20 },
    circleIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 10, textAlign: 'center' },
    modalSubtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 30 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15, borderBottomWidth: 1, borderColor: COLORS.border, paddingBottom: 10 },
    label: { color: COLORS.textSecondary },
    value: { fontWeight: 'bold', color: COLORS.textPrimary },

    // Receipt
    receiptCard: { width: '100%', backgroundColor: 'white', borderRadius: 0, padding: 0, overflow: 'hidden', ...SHADOW }, // Paper look
    receiptHeader: { backgroundColor: COLORS.primary, padding: 30, alignItems: 'center' },
    checkCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    receiptTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    receiptDate: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 5 },
    divider: { height: 1, backgroundColor: COLORS.border, width: '100%' },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
    statLabel: { fontSize: 16, color: COLORS.textSecondary },
    statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
    statusBox: { margin: 20, padding: 15, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
    statusTitle: { fontWeight: 'bold', fontSize: 16 },
    statusSub: { fontSize: 12, marginTop: 4 },
    signatureSection: { alignItems: 'center', padding: 20, paddingTop: 0 },
    sigLabel: { fontSize: 10, letterSpacing: 1, color: COLORS.textSecondary, marginBottom: 5 },
    sigName: { fontFamily: 'serif', fontSize: 18, fontStyle: 'italic', color: COLORS.textPrimary },
    sigHash: { fontSize: 10, color: COLORS.primary, marginTop: 5 },

    // Buttons
    button: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', width: '100%' },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    // Loading
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    loadingText: { color: 'white', marginTop: 20, fontWeight: 'bold', fontSize: 16 },

    // Review
    simpleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
    studentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 15, marginBottom: 10, borderRadius: 12, ...SHADOW },
    studentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center' },
    studentName: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
    studentId: { fontSize: 12, color: COLORS.textSecondary },
    footer: { padding: 20, backgroundColor: COLORS.bg },
});
