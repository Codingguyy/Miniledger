import React, { useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { addLoan } from "../api";
import { colors } from "../theme";

function nextWeek() {
  const date = new Date(Date.now() + 7 * 86400000);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function AddLoanScreen({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(nextWeek());
  const [photo, setPhoto] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function pickPhoto() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted" && Platform.OS !== "web") {
        setError("Please allow photo library access to attach a receipt.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.65 });
      if (!result.canceled && result.assets[0]?.uri) {
        setPhoto(result.assets[0].uri);
        setError("");
      }
    } catch {
      setError("Couldn't open your photo library. You can continue without a receipt.");
    }
  }

  async function save() {
    if (!name.trim()) return setError("Add your friend's name to continue.");
    if (!amount.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0) return setError("Enter an amount greater than zero.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(Date.parse(dueDate))) return setError("Enter the due date as YYYY-MM-DD.");
    try {
      setBusy(true);
      setError("");
      await addLoan(name.trim(), amount, dueDate, photo || undefined);
      onDone();
    } catch (e: any) {
      setError(e.message || "Couldn't save this loan. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}><TouchableOpacity onPress={onCancel} style={styles.backButton}><Text style={styles.backText}>←</Text></TouchableOpacity><View><Text style={styles.headerTitle}>New loan</Text><Text style={styles.headerSub}>ADD A RECORD TO YOUR LEDGER</Text></View><View style={{ flex: 1 }} /><View style={styles.step}><Text style={styles.stepText}>01 / 01</Text></View></View>
        <View style={styles.intro}><View style={styles.introIcon}><Text style={styles.introIconText}>＋</Text></View><Text style={styles.title}>Make it official.</Text><Text style={styles.subtitle}>Record the details now, so you don't have to remember them later.</Text></View>
        <View style={styles.formCard}>
          <View style={styles.sectionLabelRow}><Text style={styles.sectionLabel}>LOAN DETAILS</Text><Text style={styles.required}>* REQUIRED</Text></View>
          <Text style={styles.label}>FRIEND'S NAME</Text>
          <TextInput style={styles.input} placeholder="e.g. Rahul Sharma" placeholderTextColor="#63766C" value={name} onChangeText={setName} autoCapitalize="words" returnKeyType="next" />
          <Text style={styles.label}>AMOUNT LENT</Text>
          <View style={styles.amountWrap}><Text style={styles.currency}>₹</Text><TextInput style={styles.amountInput} placeholder="0.00" placeholderTextColor="#63766C" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} /><Text style={styles.inr}>INR</Text></View>
          <Text style={styles.label}>REPAYMENT DUE DATE</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor="#63766C" value={dueDate} onChangeText={setDueDate} />
          <Text style={styles.helper}>Choose the date you expect the money to be returned.</Text>
          <View style={styles.divider} />
          <View style={styles.receiptHeading}><View><Text style={styles.label}>RECEIPT PHOTO</Text><Text style={styles.receiptSub}>Optional · JPG or PNG</Text></View><View style={styles.optionalPill}><Text style={styles.optionalText}>OPTIONAL</Text></View></View>
          <TouchableOpacity style={[styles.uploadBox, photo && styles.uploadBoxSelected]} onPress={pickPhoto} activeOpacity={0.8}>
            {photo ? <Image source={{ uri: photo }} style={styles.preview} /> : <View style={styles.uploadIcon}><Text style={styles.uploadIconText}>↑</Text></View>}
            <View style={styles.uploadTextWrap}><Text style={styles.uploadTitle}>{photo ? "Receipt selected" : "Attach a receipt"}</Text><Text style={styles.uploadSub}>{photo ? "Tap to choose a different image" : "Choose an image from your device"}</Text></View>
            <Text style={styles.uploadArrow}>↗</Text>
          </TouchableOpacity>
          {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
          <TouchableOpacity style={[styles.saveButton, busy && { opacity: 0.7 }]} onPress={save} disabled={busy} activeOpacity={0.85}>{busy ? <ActivityIndicator color={colors.bg} /> : <><Text style={styles.saveText}>Save loan record</Text><Text style={styles.saveArrow}>→</Text></>}</TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={busy}><Text style={styles.cancelText}>Cancel and go back</Text></TouchableOpacity>
        </View>
        <View style={styles.privacy}><Text style={styles.privacyIcon}>⌑</Text><Text style={styles.privacyText}>Your records are stored in your personal ledger and can be reviewed anytime.</Text></View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 35, maxWidth: 680, width: "100%", alignSelf: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  backButton: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  backText: { color: colors.text, fontSize: 24, marginTop: -2 },
  headerTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  headerSub: { color: colors.muted, fontSize: 8, fontWeight: "800", letterSpacing: 1.1, marginTop: 3 },
  step: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 7 },
  stepText: { color: colors.muted, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  intro: { marginTop: 30, marginBottom: 24 },
  introIcon: { width: 45, height: 45, borderRadius: 15, backgroundColor: colors.primaryDark, borderWidth: 1, borderColor: "#38582D", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  introIconText: { color: colors.primary, fontSize: 27, fontWeight: "500" },
  title: { color: colors.text, fontSize: 31, fontWeight: "900", letterSpacing: -1 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8, maxWidth: 390 },
  formCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 19 },
  sectionLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  sectionLabel: { color: colors.text, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  required: { color: colors.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.8 },
  label: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1.3, marginBottom: 9 },
  input: { minHeight: 51, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, color: colors.text, fontSize: 14, marginBottom: 20 },
  amountWrap: { flexDirection: "row", alignItems: "center", minHeight: 58, backgroundColor: colors.bg, borderWidth: 1, borderColor: "#48643C", borderRadius: 12, paddingHorizontal: 14, marginBottom: 20 },
  currency: { color: colors.primary, fontSize: 23, fontWeight: "800", marginRight: 10 },
  amountInput: { flex: 1, color: colors.text, fontSize: 23, fontWeight: "800", paddingVertical: 10 },
  inr: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  helper: { color: colors.muted, fontSize: 10, marginTop: -12, marginBottom: 19 },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 20 },
  receiptHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  receiptSub: { color: colors.muted, fontSize: 10, marginTop: -3 },
  optionalPill: { borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 5 },
  optionalText: { color: colors.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.7 },
  uploadBox: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border, borderStyle: "dashed", borderRadius: 13, padding: 12, marginBottom: 18, minHeight: 75 },
  uploadBoxSelected: { borderStyle: "solid", borderColor: "#48643C" },
  uploadIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.primaryDark, alignItems: "center", justifyContent: "center" },
  uploadIconText: { color: colors.primary, fontSize: 24, fontWeight: "700" },
  preview: { width: 50, height: 50, borderRadius: 9 },
  uploadTextWrap: { flex: 1 },
  uploadTitle: { color: colors.text, fontSize: 12, fontWeight: "800" },
  uploadSub: { color: colors.muted, fontSize: 10, marginTop: 4 },
  uploadArrow: { color: colors.primary, fontSize: 19, fontWeight: "800" },
  errorBox: { backgroundColor: colors.lightRed, borderRadius: 10, padding: 11, marginBottom: 13 },
  errorText: { color: colors.red, fontSize: 11, lineHeight: 16 },
  saveButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 13, minHeight: 53, backgroundColor: colors.primary, borderRadius: 13 },
  saveText: { color: colors.bg, fontSize: 13, fontWeight: "900" },
  saveArrow: { color: colors.bg, fontSize: 20, fontWeight: "700" },
  cancelButton: { alignItems: "center", paddingVertical: 15 },
  cancelText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  privacy: { flexDirection: "row", gap: 9, alignItems: "center", paddingHorizontal: 5, marginTop: 18 },
  privacyIcon: { color: colors.primary, fontSize: 19 },
  privacyText: { flex: 1, color: colors.muted, fontSize: 10, lineHeight: 16 },
});
