export function checkPhone(phone: any) {
  return /^\+?[0-9]{10,13}$/.test(String(phone || ""));
}
export function checkLoan(body: any): string | null {
  if (!body.friendName || !String(body.friendName).trim()) return "Friend name is required";
  const amount = Number(body.amount);
  if (!amount || amount <= 0) return "Amount must be more than 0";
  const date = String(body.dueDate || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) return "Due date must be YYYY-MM-DD";
  return null;
}
