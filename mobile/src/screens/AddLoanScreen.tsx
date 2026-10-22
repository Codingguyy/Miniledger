import React, { useState } from "react";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { addLoan } from "../api";
import { colors } from "../theme";

function nextWeek() {
  return new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
}

export default function AddLoanScreen({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(nextWeek());
  const [photo, setPhoto] = useState("");
  const [error, setError] = useState("");

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5 });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  }

  async function save() {
    if (!name.trim()) return setError("Enter friend name");
    if (!amount || Number(amount) <= 0) return setError("Enter a valid amount");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return setError("Date should look like 2026-12-31");
    try {
      await addLoan(name.trim(), amount, dueDate, photo);
      onDone();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add entry</Text>
      <TextInput style={styles.input} placeholder="Friend name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Amount" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
      <TextInput style={styles.input} placeholder="Due date (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} />
      <TouchableOpacity style={styles.photoButton} onPress={pickPhoto}>
        <Text style={styles.photoText}>{photo ? "Change receipt photo" : "Add receipt photo (optional)"}</Text>
      </TouchableOpacity>
      {photo !== "" && <Image source={{ uri: photo }} style={styles.preview} />}
      {error !== "" && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.button} onPress={save}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onCancel}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, backgroundColor: colors.bg, flexGrow: 1 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 16, color: colors.text },
  input: { backgroundColor: "white", borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  photoButton: { borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: 12, alignItems: "center", marginBottom: 12 },
  photoText: { color: colors.primary, fontWeight: "600" },
  preview: { width: "100%", height: 160, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: colors.primary, padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  cancel: { textAlign: "center", color: colors.muted, marginTop: 16 },
  error: { color: colors.red, marginBottom: 8 },
});
