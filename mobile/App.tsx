import React, { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, Text, View } from "react-native";
import { clearToken, loadToken } from "./src/api";
import AddLoanScreen from "./src/screens/AddLoanScreen";
import LoansScreen from "./src/screens/LoansScreen";
import LoginScreen from "./src/screens/LoginScreen";
import { colors } from "./src/theme";

export default function App() {
  const [screen, setScreen] = useState("loading");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadToken()
      .then((token) => setScreen(token ? "list" : "login"))
      .catch(() => setScreen("login"));
  }, []);

  async function logout() {
    await clearToken();
    setScreen("login");
  }

  function added() {
    setRefreshKey((key) => key + 1);
    setScreen("list");
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      {screen === "loading" ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 14 }}>
          <View style={{ width: 58, height: 58, borderRadius: 20, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 27, fontWeight: "900", color: colors.bg }}>M</Text>
          </View>
          <ActivityIndicator color={colors.primary} />
          <Text style={{ color: colors.muted }}>Getting your ledger ready…</Text>
        </View>
      ) : null}
      {screen === "login" && <LoginScreen onLogin={() => setScreen("list")} />}
      {screen === "list" && <LoansScreen key={refreshKey} onAdd={() => setScreen("add")} onLogout={logout} />}
      {screen === "add" && <AddLoanScreen onDone={added} onCancel={() => setScreen("list")} />}
    </View>
  );
}
