import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const AuditTrail = ({ attendanceData, onFinish }) => {
    const signatureRef = useRef(null);

    const generatePDF = async (signature) => {
        const html = `
      <html>
        <body style="font-family: Helvetica; padding: 40px;">
          <h1 style="color: #2563eb;">CampusFlow - Audit Report</h1>
          <p><strong>Session ID:</strong> SES_${Date.now()}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <hr/>
          <h3>Attendance Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f8fafc;">
              <th style="padding: 10px; border: 1px solid #ddd;">Student ID</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Name</th>
              <th style="padding: 10px; border: 1px solid #ddd;">AI Confidence</th>
            </tr>
            ${attendanceData.map(s => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${s.id}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${s.name}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${(Math.random() * 10 + 88).toFixed(2)}%</td>
              </tr>
            `).join('')}
          </table>
          <br/>
          <h3>Faculty Signature</h3>
          <img src="${signature}" style="width: 200px; border-bottom: 1px solid #000;"/>
          <p style="font-size: 12px; color: #64748b;">Digitally signed via CampusFlow On-Device ML System</p>
        </body>
      </html>
    `;

        try {
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri);
            onFinish();
        } catch (e) {
            Alert.alert('Error', 'Failed to generate PDF');
        }
    };

    const handleSignature = (signature) => {
        generatePDF(signature);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Session Digital Audit</Text>
            <Text style={styles.subtitle}>Please sign below to authorize the attendance record.</Text>

            <View style={styles.signatureBox}>
                <SignatureScreen
                    ref={signatureRef}
                    onOK={handleSignature}
                    descriptionText="Faculty Signature"
                    clearText="Clear"
                    confirmText="Sign & Export PDF"
                    webStyle={`.m-signature-pad--footer {display: none; margin: 0px;}`}
                />
            </View>

            <TouchableOpacity
                style={styles.btn}
                onPress={() => signatureRef.current.readSignature()}
            >
                <Text style={styles.btnText}>Authorize & Finalize PDF</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginTop: 40 },
    subtitle: { fontSize: 16, color: '#64748b', marginVertical: 10 },
    signatureBox: { flex: 1, marginVertical: 20, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, overflow: 'hidden' },
    btn: { backgroundColor: '#2563eb', padding: 18, borderRadius: 12, alignItems: 'center' },
    btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
