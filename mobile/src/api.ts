import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { API_URL } from "./config";

export type Loan = {
  id: number;
  friendName: string;
  amount: number;
  dueDate: string;
  repaid: boolean;
  receipt: string | null;
  overdue: boolean;
};

export type Summary = { totalLent: number; totalRepaid: number; overdueAmount: number };

let token: string | null = null;

async function getStoredToken() {
  return Platform.OS === "web"
    ? AsyncStorage.getItem("token")
    : SecureStore.getItemAsync("token");
}

async function storeToken(value: string) {
  if (Platform.OS === "web") await AsyncStorage.setItem("token", value);
  else await SecureStore.setItemAsync("token", value);
}

async function removeStoredToken() {
  if (Platform.OS === "web") await AsyncStorage.removeItem("token");
  else await SecureStore.deleteItemAsync("token");
}

export async function loadToken() {
  token = await getStoredToken();
  return token;
}

export async function saveToken(value: string) {
  token = value;
  await storeToken(value);
}

export async function clearToken() {
  token = null;
  await removeStoredToken();
}

async function request(path: string, init: any = {}) {
  const headers: Record<string, string> = { ...(init.headers || {}) };
  if (token) headers.Authorization = "Bearer " + token;

  let response: Response;
  try {
    response = await fetch(API_URL + path, { ...init, headers });
  } catch {
    throw new Error("Cannot reach the server. Check your connection and try again.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

const post = (body: object) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const requestOtp = (phone: string) => request("/auth/request-otp", post({ phone }));
export const verifyOtp = (phone: string, otp: string): Promise<{ token: string }> =>
  request("/auth/verify-otp", post({ phone, otp }));
export const getLoans = (): Promise<Loan[]> => request("/loans");
export const getSummary = (): Promise<Summary> => request("/summary");
export const markRepaid = (id: number) => request("/loans/" + id + "/repay", { method: "POST" });
export const receiptUrl = (name: string) => API_URL + "/uploads/" + name;

export async function addLoan(friendName: string, amount: string, dueDate: string, photo?: string) {
  const form = new FormData();
  form.append("friendName", friendName);
  form.append("amount", amount);
  form.append("dueDate", dueDate);

  if (photo) {
    if (Platform.OS === "web") {
      const imageResponse = await fetch(photo);
      const blob = await imageResponse.blob();
      form.append("receipt", blob, "receipt.jpg");
    } else {
      form.append("receipt", { uri: photo, name: "receipt.jpg", type: "image/jpeg" } as any);
    }
  }

  return request("/loans", { method: "POST", body: form });
}
