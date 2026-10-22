import * as SecureStore from "expo-secure-store";
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

export async function loadToken() {
  token = await SecureStore.getItemAsync("token");
  return token;
}
export async function saveToken(t: string) {
  token = t;
  await SecureStore.setItemAsync("token", t);
}
export async function clearToken() {
  token = null;
  await SecureStore.deleteItemAsync("token");
}

async function request(path: string, init: any = {}) {
  const headers = { ...(init.headers || {}) };
  if (token) headers.Authorization = "Bearer " + token;
  let res;
  try {
    res = await fetch(API_URL + path, { ...init, headers });
  } catch (e) {
    throw new Error("Cannot reach the server");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
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

export function addLoan(friendName: string, amount: string, dueDate: string, photo?: string) {
  const form = new FormData();
  form.append("friendName", friendName);
  form.append("amount", amount);
  form.append("dueDate", dueDate);
  if (photo) form.append("receipt", { uri: photo, name: "receipt.jpg", type: "image/jpeg" } as any);
  return request("/loans", { method: "POST", body: form });
}
