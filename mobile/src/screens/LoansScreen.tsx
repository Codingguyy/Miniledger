import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { getLoans, getSummary, Loan, markRepaid, receiptUrl, Summary } from "../api";
import { colors } from "../theme";

export default function LoansScreen({ onAdd, onLogout }: { onAdd: () => void; onLogout: () => void }) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalLent: 0, totalRepaid: 0, overdueAmount: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoans(await getLoans());
      setSummary(await getSummary());
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
    setRefreshing(false);
  }

  useEffect(() => {
    load();
  }, []);

  function repay(loan: Loan) {
    Alert.alert("Mark as repaid?", loan.friendName + " paid back Rs " + loan.amount, [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", onPress: async () => { await markRepaid(loan.id); load(); } },
    ]);
  }

  function renderLoan({ item }: { item: Loan }) {
    return (
      <View style={[styles.row, item.overdue && styles.overdueRow]}>
        {item.receipt && <Image source={{ uri: receiptUrl(item.receipt) }} style={styles.thumb} />}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.friendName}</Text>
          <Text style={[styles.date, item.overdue && { color: colors.red }]}>
            {item.repaid ? "Repaid" : item.overdue ? "Overdue - was due " + item.dueDate : "Due " + item.dueDate}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.amount, item.repaid && { color: colors.green }]}>Rs {item.amount}</Text>
          {!item.repaid && (
            <TouchableOpacity onPress={() => repay(item)}>
              <Text style={styles.repay}>Mark repaid</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const header = (
    <View style={styles.summary}>
      <Text style={styles.summaryLabel}>Total lent</Text>
      <Text style={styles.summaryBig}>Rs {summary.totalLent}</Text>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryLabel}>Repaid</Text>
          <Text style={styles.summaryValue}>Rs {summary.totalRepaid}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryLabel}>Overdue</Text>
          <Text style={styles.summaryValue}>Rs {summary.overdueAmount}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.title}>MiniLedger</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>
      {error !== "" && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={loans}
        keyExtractor={(l) => String(l.id)}
        renderItem={renderLoan}
        ListHeaderComponent={header}
        ListEmptyComponent={<Text style={styles.empty}>No entries yet. Tap + to add one.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <TouchableOpacity style={styles.fab} onPress={onAdd}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 54 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: "bold", color: colors.text },
  logout: { color: colors.primary, fontWeight: "600" },
  error: { color: colors.red, paddingHorizontal: 16 },
  summary: { backgroundColor: colors.primary, margin: 16, borderRadius: 14, padding: 18 },
  summaryLabel: { color: "#D5DDFF", fontSize: 12 },
  summaryBig: { color: "white", fontSize: 30, fontWeight: "bold", marginBottom: 10 },
  summaryValue: { color: "white", fontSize: 16, fontWeight: "bold" },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "white", marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  overdueRow: { backgroundColor: colors.lightRed, borderColor: colors.red, borderLeftWidth: 5 },
  thumb: { width: 44, height: 44, borderRadius: 6, marginRight: 10 },
  name: { fontSize: 17, fontWeight: "bold", color: colors.text },
  date: { color: colors.muted, marginTop: 2 },
  amount: { fontSize: 17, fontWeight: "bold", color: colors.text },
  repay: { color: colors.green, fontWeight: "600", marginTop: 6 },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
  fab: { position: "absolute", right: 20, bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  fabText: { color: "white", fontSize: 30 },
});
