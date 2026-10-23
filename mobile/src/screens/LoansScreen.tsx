import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getLoans, getSummary, Loan, markRepaid, receiptUrl, Summary } from "../api";
import { colors } from "../theme";

function money(value: number) {
  return "₹" + Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export default function LoansScreen({ onAdd, onLogout }: { onAdd: () => void; onLogout: () => void }) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalLent: 0, totalRepaid: 0, overdueAmount: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [repaying, setRepaying] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      const [loanData, summaryData] = await Promise.all([getLoans(), getSummary()]);
      setLoans(loanData);
      setSummary(summaryData);
    } catch (e: any) {
      setError(e.message || "Couldn't load your ledger.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function confirmRepay() {
    if (!selectedLoan) return;
    try {
      setRepaying(true);
      await markRepaid(selectedLoan.id);
      setSelectedLoan(null);
      await load();
    } catch (e: any) {
      setError(e.message || "Couldn't update the repayment.");
    } finally {
      setRepaying(false);
    }
  }

  function renderLoan({ item }: { item: Loan }) {
    const isOverdue = item.overdue && !item.repaid;
    return (
      <View style={[styles.loanCard, isOverdue && styles.loanCardOverdue]}>
        <View style={[styles.avatar, isOverdue && styles.avatarOverdue, item.repaid && styles.avatarRepaid]}>
          <Text style={[styles.avatarText, item.repaid && { color: colors.primary }]}>{(item.friendName || "?").trim().charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.loanInfo}>
          <Text style={styles.loanName} numberOfLines={1}>{item.friendName}</Text>
          <Text style={styles.loanDate}>{item.repaid ? "Settled" : `Due ${item.dueDate}`}</Text>
          <View style={[styles.statusPill, isOverdue ? styles.overduePill : item.repaid ? styles.repaidPill : styles.pendingPill]}>
            <View style={[styles.statusDot, { backgroundColor: isOverdue ? colors.red : item.repaid ? colors.primary : "#E9B86A" }]} />
            <Text style={[styles.statusText, isOverdue && { color: colors.red }]}>{item.repaid ? "REPAID" : isOverdue ? "OVERDUE" : "PENDING"}</Text>
          </View>
          {item.receipt ? <TouchableOpacity onPress={() => {}} style={styles.receiptLink}><Image source={{ uri: receiptUrl(item.receipt) }} style={styles.receiptThumb} /><Text style={styles.receiptText}>Receipt attached</Text></TouchableOpacity> : null}
        </View>
        <View style={styles.loanAmountColumn}>
          <Text style={[styles.loanAmount, item.repaid && { color: colors.primary }]}>{money(item.amount)}</Text>
          {!item.repaid && <TouchableOpacity style={styles.repayButton} onPress={() => setSelectedLoan(item)}><Text style={styles.repayButtonText}>Settle ↗</Text></TouchableOpacity>}
        </View>
      </View>
    );
  }

  const activeCount = loans.filter((loan) => !loan.repaid).length;
  const overdueCount = loans.filter((loan) => loan.overdue && !loan.repaid).length;

  return (
    <View style={styles.container}>
      <FlatList
        data={loans}
        keyExtractor={(loan) => String(loan.id)}
        renderItem={renderLoan}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={colors.primary} colors={[colors.primary]} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.brandRow}><View style={styles.brandMark}><Text style={styles.brandLetter}>M</Text></View><View><Text style={styles.brandName}>MiniLedger</Text><Text style={styles.brandCaption}>PERSONAL FINANCE, SIMPLIFIED</Text></View></View>
              <TouchableOpacity onPress={onLogout} style={styles.logoutButton}><Text style={styles.logoutText}>↗</Text></TouchableOpacity>
            </View>
            <View style={styles.greetingRow}><View><Text style={styles.greeting}>Your money, clearly.</Text><Text style={styles.greetingSub}>A little more organized today.</Text></View><View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE LEDGER</Text></View></View>
            <View style={styles.balanceCard}>
              <View style={styles.balanceTop}><Text style={styles.balanceLabel}>TOTAL LENT</Text><View style={styles.balanceIcon}><Text style={styles.balanceIconText}>↗</Text></View></View>
              <Text style={styles.balanceValue}>{money(summary.totalLent)}</Text>
              <View style={styles.balanceDivider} />
              <View style={styles.balanceBottom}><View><Text style={styles.balanceMetaLabel}>COLLECTED BACK</Text><Text style={styles.balanceMetaValue}>{money(summary.totalRepaid)}</Text></View><View style={styles.balanceMetaRight}><Text style={styles.balanceMetaLabel}>OVERDUE</Text><Text style={[styles.balanceMetaValue, summary.overdueAmount > 0 && { color: colors.red }]}>{money(summary.overdueAmount)}</Text></View></View>
              <View style={styles.glowOne} /><View style={styles.glowTwo} />
            </View>
            <View style={styles.statRow}>
              <View style={styles.statCard}><Text style={styles.statIcon}>◷</Text><Text style={styles.statValue}>{activeCount}</Text><Text style={styles.statLabel}>Open loans</Text></View>
              <View style={styles.statCard}><Text style={[styles.statIcon, overdueCount > 0 && { color: colors.red }]}>!</Text><Text style={styles.statValue}>{overdueCount}</Text><Text style={styles.statLabel}>Overdue</Text></View>
              <View style={styles.statCard}><Text style={[styles.statIcon, { color: colors.primary }]}>✓</Text><Text style={styles.statValue}>{loans.filter((loan) => loan.repaid).length}</Text><Text style={styles.statLabel}>Settled</Text></View>
            </View>
            <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Your loans</Text><Text style={styles.sectionSub}>{loans.length ? `${loans.length} ${loans.length === 1 ? "record" : "records"} in your ledger` : "Every loan, all in one place"}</Text></View><TouchableOpacity style={styles.addSmall} onPress={onAdd}><Text style={styles.addSmallText}>＋ Add loan</Text></TouchableOpacity></View>
            {!!error && <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text><TouchableOpacity onPress={load}><Text style={styles.retryText}>Retry</Text></TouchableOpacity></View>}
            {loading && <View style={styles.loading}><ActivityIndicator color={colors.primary} /><Text style={styles.loadingText}>Loading your loans…</Text></View>}
          </View>
        }
        ListEmptyComponent={!loading && !error ? <View style={styles.emptyCard}><View style={styles.emptyIcon}><Text style={styles.emptyIconText}>＋</Text></View><Text style={styles.emptyTitle}>Your ledger starts here</Text><Text style={styles.emptyText}>Add your first loan and keep track of when it comes back.</Text><TouchableOpacity style={styles.emptyButton} onPress={onAdd}><Text style={styles.emptyButtonText}>Add your first loan  →</Text></TouchableOpacity></View> : null}
        ListFooterComponent={<Text style={styles.footer}>YOUR LEDGER. YOUR PEACE OF MIND.</Text>}
      />
      <TouchableOpacity activeOpacity={0.86} style={styles.fab} onPress={onAdd}><Text style={styles.fabPlus}>＋</Text><Text style={styles.fabLabel}>New loan</Text></TouchableOpacity>
      <Modal visible={!!selectedLoan} transparent animationType="fade" onRequestClose={() => setSelectedLoan(null)}>
        <View style={styles.modalBackdrop}><View style={styles.modalCard}><View style={styles.modalIcon}><Text style={styles.modalIconText}>✓</Text></View><Text style={styles.modalTitle}>Mark as repaid?</Text><Text style={styles.modalCopy}>{selectedLoan ? `${selectedLoan.friendName} paid back ${money(selectedLoan.amount)}. Confirm to update your ledger.` : "Confirm repayment."}</Text><TouchableOpacity disabled={repaying} onPress={confirmRepay} style={styles.modalConfirm}>{repaying ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.modalConfirmText}>Confirm repayment</Text>}</TouchableOpacity><TouchableOpacity disabled={repaying} onPress={() => setSelectedLoan(null)} style={styles.modalCancel}><Text style={styles.modalCancelText}>Not yet</Text></TouchableOpacity></View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  listContent: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 110, maxWidth: 760, width: "100%", alignSelf: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  brandMark: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  brandLetter: { fontSize: 24, fontWeight: "900", color: colors.bg },
  brandName: { color: colors.text, fontSize: 17, fontWeight: "800", letterSpacing: -0.4 },
  brandCaption: { color: colors.muted, fontSize: 8, fontWeight: "800", letterSpacing: 1.2, marginTop: 3 },
  logoutButton: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  logoutText: { color: colors.muted, fontSize: 21, transform: [{ rotate: "45deg" }] },
  greetingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 30, marginBottom: 18, gap: 8 },
  greeting: { color: colors.text, fontSize: 25, fontWeight: "800", letterSpacing: -0.8 },
  greetingSub: { color: colors.muted, fontSize: 12, marginTop: 6 },
  livePill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 30, paddingHorizontal: 9, paddingVertical: 7 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  liveText: { color: colors.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.8 },
  balanceCard: { overflow: "hidden", backgroundColor: colors.primaryDark, borderRadius: 24, borderWidth: 1, borderColor: "#38582D", padding: 22, position: "relative" },
  balanceTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  balanceLabel: { color: "#B3C6A8", fontSize: 10, fontWeight: "800", letterSpacing: 1.8 },
  balanceIcon: { width: 33, height: 33, borderRadius: 11, backgroundColor: "#2D4A23", alignItems: "center", justifyContent: "center" },
  balanceIconText: { color: colors.primary, fontSize: 22, fontWeight: "700" },
  balanceValue: { color: colors.text, fontSize: 39, fontWeight: "900", letterSpacing: -1.4, marginTop: 8, marginBottom: 20 },
  balanceDivider: { height: 1, backgroundColor: "#3B5432", marginBottom: 16 },
  balanceBottom: { flexDirection: "row", justifyContent: "space-between" },
  balanceMetaRight: { alignItems: "flex-end" },
  balanceMetaLabel: { color: "#A0B598", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  balanceMetaValue: { color: colors.text, fontSize: 16, fontWeight: "800", marginTop: 6 },
  glowOne: { position: "absolute", width: 140, height: 140, borderRadius: 70, backgroundColor: "#42652C", opacity: 0.12, right: -45, top: -75 },
  glowTwo: { position: "absolute", width: 90, height: 90, borderRadius: 45, borderWidth: 1, borderColor: "#65854B", opacity: 0.25, right: 20, top: -36 },
  statRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 17, paddingVertical: 13, paddingHorizontal: 13 },
  statIcon: { color: "#E9B86A", fontSize: 17, fontWeight: "900", marginBottom: 8 },
  statValue: { color: colors.text, fontSize: 23, fontWeight: "800" },
  statLabel: { color: colors.muted, fontSize: 10, marginTop: 4 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 29, marginBottom: 15, gap: 10 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "800", letterSpacing: -0.4 },
  sectionSub: { color: colors.muted, fontSize: 11, marginTop: 5 },
  addSmall: { backgroundColor: colors.primary, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 10 },
  addSmallText: { color: colors.bg, fontSize: 11, fontWeight: "900" },
  loanCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14, marginBottom: 10 },
  loanCardOverdue: { borderColor: "#663532", backgroundColor: "#171A17" },
  avatar: { width: 44, height: 44, borderRadius: 15, backgroundColor: "#24362C", alignItems: "center", justifyContent: "center" },
  avatarOverdue: { backgroundColor: colors.lightRed },
  avatarRepaid: { backgroundColor: "#263A20" },
  avatarText: { color: colors.text, fontSize: 17, fontWeight: "800" },
  loanInfo: { flex: 1, minWidth: 0 },
  loanName: { color: colors.text, fontSize: 14, fontWeight: "800", marginTop: 2 },
  loanDate: { color: colors.muted, fontSize: 10, marginTop: 5 },
  statusPill: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 5, marginTop: 9 },
  overduePill: { backgroundColor: colors.lightRed },
  repaidPill: { backgroundColor: "#20351D" },
  pendingPill: { backgroundColor: "#332B1D" },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { color: "#E9B86A", fontSize: 8, fontWeight: "900", letterSpacing: 0.7 },
  loanAmountColumn: { alignItems: "flex-end", paddingLeft: 2 },
  loanAmount: { color: colors.text, fontSize: 15, fontWeight: "900", marginTop: 3 },
  repayButton: { marginTop: 11, backgroundColor: "#293B27", borderRadius: 8, paddingHorizontal: 9, paddingVertical: 7 },
  repayButtonText: { color: colors.primary, fontSize: 10, fontWeight: "900" },
  receiptLink: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 7 },
  receiptThumb: { width: 17, height: 17, borderRadius: 4 },
  receiptText: { color: colors.muted, fontSize: 9 },
  emptyCard: { alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderStyle: "dashed", borderRadius: 20, paddingHorizontal: 24, paddingVertical: 30 },
  emptyIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.primaryDark, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyIconText: { color: colors.primary, fontSize: 29, fontWeight: "500" },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  emptyText: { color: colors.muted, fontSize: 12, lineHeight: 19, textAlign: "center", maxWidth: 250, marginTop: 7 },
  emptyButton: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 17, paddingVertical: 12, marginTop: 18 },
  emptyButtonText: { color: colors.bg, fontWeight: "900", fontSize: 12 },
  loading: { alignItems: "center", padding: 24, gap: 9 },
  loadingText: { color: colors.muted, fontSize: 12 },
  errorBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.lightRed, borderRadius: 12, padding: 12, marginBottom: 12 },
  errorText: { color: colors.red, fontSize: 11, flex: 1 },
  retryText: { color: colors.primary, fontSize: 11, fontWeight: "800", marginLeft: 12 },
  footer: { textAlign: "center", color: "#52655B", fontSize: 8, fontWeight: "800", letterSpacing: 1.7, marginTop: 24, marginBottom: 12 },
  fab: { position: "absolute", right: 22, bottom: 24, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primary, borderRadius: 17, paddingHorizontal: 17, paddingVertical: 14, elevation: 8, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  fabPlus: { color: colors.bg, fontSize: 22, lineHeight: 23, fontWeight: "500" },
  fabLabel: { color: colors.bg, fontSize: 12, fontWeight: "900" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalCard: { width: "100%", maxWidth: 380, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 24, alignItems: "center" },
  modalIcon: { width: 52, height: 52, borderRadius: 17, backgroundColor: colors.primaryDark, alignItems: "center", justifyContent: "center", marginBottom: 15 },
  modalIconText: { color: colors.primary, fontSize: 25, fontWeight: "900" },
  modalTitle: { color: colors.text, fontSize: 21, fontWeight: "900" },
  modalCopy: { color: colors.muted, textAlign: "center", fontSize: 13, lineHeight: 20, marginTop: 9, marginBottom: 20 },
  modalConfirm: { width: "100%", minHeight: 48, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  modalConfirmText: { color: colors.bg, fontWeight: "900", fontSize: 13 },
  modalCancel: { padding: 13 },
  modalCancelText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
});
