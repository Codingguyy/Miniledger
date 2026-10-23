import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { requestOtp, saveToken, verifyOtp } from "../api";
import { colors } from "../theme";

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendOtp() {
    if (phone.trim().length < 10) return setError("Enter a valid phone number to continue.");
    try {
      setBusy(true);
      setError("");
      await requestOtp(phone.trim());
      setOtpSent(true);
    } catch (e: any) {
      setError(e.message || "Couldn't send the verification code.");
    } finally {
      setBusy(false);
    }
  }

  async function login() {
    if (!otp.trim()) return setError("Enter the verification code.");
    try {
      setBusy(true);
      setError("");
      const data = await verifyOtp(phone.trim(), otp.trim());
      await saveToken(data.token);
      onLogin();
    } catch (e: any) {
      setError(e.message || "Verification failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.topline}>
          <View style={styles.brandMark}><Text style={styles.brandLetter}>M</Text></View>
          <Text style={styles.brand}>MINILEDGER</Text>
          <View style={styles.securePill}><View style={styles.dot} /><Text style={styles.secureText}>PRIVATE BY DESIGN</Text></View>
        </View>

        <View style={styles.hero}>
          <View style={styles.orbitOuter}><View style={styles.orbitInner}><Text style={styles.heroSymbol}>↗</Text></View><View style={styles.orbitDot} /></View>
          <Text style={styles.eyebrow}>YOUR MONEY, IN GOOD ORDER</Text>
          <Text style={styles.title}>Keep track.{"\n"}<Text style={styles.titleAccent}>Stay in control.</Text></Text>
          <Text style={styles.subtitle}>A clearer way to keep up with money lent to friends, repayments, and due dates.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{otpSent ? "Verify it's you" : "Welcome back"}</Text>
          <Text style={styles.formSub}>{otpSent ? "Enter the code sent for your phone number." : "Sign in with your phone number to open your ledger."}</Text>
          <Text style={styles.label}>PHONE NUMBER</Text>
          <View style={styles.inputWrap}><Text style={styles.countryCode}>+91</Text><View style={styles.inputDivider} /><TextInput style={styles.input} placeholder="98765 43210" placeholderTextColor="#63766C" keyboardType="phone-pad" value={phone} onChangeText={setPhone} editable={!otpSent} /></View>
          {otpSent && <><Text style={[styles.label, { marginTop: 17 }]}>VERIFICATION CODE</Text><TextInput style={styles.otpInput} placeholder="Enter 6-digit OTP" placeholderTextColor="#63766C" keyboardType="number-pad" value={otp} onChangeText={setOtp} maxLength={6} /></>}
          {!!error && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity activeOpacity={0.86} style={[styles.button, busy && styles.buttonBusy]} onPress={otpSent ? login : sendOtp} disabled={busy}>
            {busy ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.buttonText}>{otpSent ? "Verify and continue" : "Continue with phone"} <Text style={styles.buttonArrow}>→</Text></Text>}
          </TouchableOpacity>
          {otpSent && <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(""); setError(""); }} style={styles.changeNumber}><Text style={styles.changeNumberText}>Use a different number</Text></TouchableOpacity>}
          <View style={styles.note}><Text style={styles.lock}>⌑</Text><Text style={styles.noteText}>Your ledger is personal. Sign in to access your records securely.</Text></View>
        </View>
        <Text style={styles.footer}>LESS GUESSING. MORE PEACE OF MIND.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, maxWidth: 560, width: "100%", alignSelf: "center" },
  topline: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  brandLetter: { color: colors.bg, fontWeight: "900", fontSize: 21 },
  brand: { color: colors.text, fontWeight: "900", fontSize: 13, letterSpacing: 2 },
  securePill: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  secureText: { color: colors.muted, fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  hero: { paddingTop: 38, paddingBottom: 28 },
  orbitOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 1, borderColor: "#385144", alignItems: "center", justifyContent: "center", marginBottom: 27 },
  orbitInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primaryDark, alignItems: "center", justifyContent: "center" },
  heroSymbol: { color: colors.primary, fontSize: 33, fontWeight: "700" },
  orbitDot: { position: "absolute", top: 1, right: 4, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.bg },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: "800", letterSpacing: 2, marginBottom: 13 },
  title: { color: colors.text, fontSize: 39, lineHeight: 44, fontWeight: "800", letterSpacing: -1.3 },
  titleAccent: { color: colors.primary },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 13, maxWidth: 400 },
  formCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 22 },
  formTitle: { color: colors.text, fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  formSub: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 6, marginBottom: 23 },
  label: { color: colors.muted, fontSize: 10, letterSpacing: 1.5, fontWeight: "800", marginBottom: 9 },
  inputWrap: { minHeight: 54, flexDirection: "row", alignItems: "center", backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 13, paddingHorizontal: 14 },
  countryCode: { color: colors.text, fontSize: 15, fontWeight: "700" },
  inputDivider: { height: 23, width: 1, backgroundColor: colors.border, marginHorizontal: 12 },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 13 },
  otpInput: { minHeight: 54, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 13, paddingHorizontal: 14, color: colors.text, fontSize: 18, letterSpacing: 5 },
  error: { color: colors.red, fontSize: 12, marginTop: 12 },
  button: { minHeight: 54, marginTop: 19, borderRadius: 13, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  buttonBusy: { opacity: 0.75 },
  buttonText: { color: colors.bg, fontSize: 14, fontWeight: "900" },
  buttonArrow: { fontSize: 19 },
  changeNumber: { alignSelf: "center", padding: 13 },
  changeNumberText: { color: colors.primary, fontWeight: "700", fontSize: 12 },
  note: { flexDirection: "row", alignItems: "center", gap: 9, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 21, paddingTop: 16 },
  lock: { color: colors.primary, fontSize: 19, fontWeight: "700" },
  noteText: { flex: 1, color: colors.muted, fontSize: 11, lineHeight: 17 },
  footer: { color: "#60746A", fontSize: 9, fontWeight: "800", letterSpacing: 2, textAlign: "center", marginTop: 24 },
});
