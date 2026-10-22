import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { requestOtp, saveToken, verifyOtp } from "../api";
import { colors } from "../theme";

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  async function sendOtp() {
    try {
      setError("");
      await requestOtp(phone.trim());
      setOtpSent(true);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function login() {
    try {
      setError("");
      const data = await verifyOtp(phone.trim(), otp.trim());
      await saveToken(data.token);
      onLogin();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MiniLedger</Text>
      <Text style={styles.sub}>Track money you lent to friends</Text>
      <TextInput style={styles.input} placeholder="Phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      {otpSent && (
        <TextInput style={styles.input} placeholder="OTP (check server log)" keyboardType="number-pad" value={otp} onChangeText={setOtp} />
      )}
      {error !== "" && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.button} onPress={otpSent ? login : sendOtp}>
        <Text style={styles.buttonText}>{otpSent ? "Login" : "Send OTP"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: "center", padding: 24 },
  title: { fontSize: 32, fontWeight: "bold", color: colors.primary },
  sub: { color: colors.muted, marginBottom: 24 },
  input: { backgroundColor: "white", borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  button: { backgroundColor: colors.primary, padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  error: { color: colors.red, marginBottom: 8 },
});
