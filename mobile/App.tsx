import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { clearToken, loadToken } from "./src/api";
import AddLoanScreen from "./src/screens/AddLoanScreen";
import LoansScreen from "./src/screens/LoansScreen";
import LoginScreen from "./src/screens/LoginScreen";

export default function App() {
  const [screen, setScreen] = useState("loading");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadToken().then((token) => setScreen(token ? "list" : "login"));
  }, []);

  async function logout() {
    await clearToken();
    setScreen("login");
  }

  function added() {
    setRefreshKey(refreshKey + 1);
    setScreen("list");
  }

  return (
    <>
      <StatusBar style="dark" />
      {screen === "login" && <LoginScreen onLogin={() => setScreen("list")} />}
      {screen === "list" && <LoansScreen key={refreshKey} onAdd={() => setScreen("add")} onLogout={logout} />}
      {screen === "add" && <AddLoanScreen onDone={added} onCancel={() => setScreen("list")} />}
    </>
  );
}
