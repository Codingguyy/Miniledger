import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import crypto from "crypto";
import { pool, setup } from "./db";
import { checkLoan, checkPhone } from "./validate";

const app = express();
const upload = multer({ dest: "uploads/" });
const otps: Record<string, string> = {};

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const wrap = (fn: any) => (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

const loanFields = `id, friend_name as "friendName", amount::float8 as amount,
  to_char(due_date, 'YYYY-MM-DD') as "dueDate", repaid, receipt,
  (not repaid and due_date < current_date) as overdue`;

async function auth(req: any, res: Response, next: NextFunction) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const result = token ? await pool.query("select id from users where token = $1", [token]) : { rows: [] };
  if (result.rows.length === 0) return res.status(401).json({ error: "Please login again" });
  req.userId = result.rows[0].id;
  next();
}

app.post("/auth/request-otp", (req, res) => {
  const phone = req.body.phone;
  if (!checkPhone(phone)) return res.status(400).json({ error: "Enter a valid phone number" });
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otps[phone] = otp;
  console.log("OTP for " + phone + " is " + otp);
  res.json({ message: "OTP sent" });
});

app.post("/auth/verify-otp", wrap(async (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  if (!otps[phone] || otps[phone] !== String(otp)) return res.status(400).json({ error: "Wrong OTP" });
  delete otps[phone];
  const token = crypto.randomBytes(16).toString("hex");
  await pool.query(
    "insert into users (phone, token) values ($1, $2) on conflict (phone) do update set token = $2",
    [phone, token]
  );
  res.json({ token });
}));

app.get("/loans", wrap(auth), wrap(async (req: any, res: Response) => {
  const result = await pool.query(
    `select ${loanFields} from loans where user_id = $1 order by repaid, due_date`,
    [req.userId]
  );
  res.json(result.rows);
}));

app.post("/loans", wrap(auth), upload.single("receipt"), wrap(async (req: any, res: Response) => {
  const error = checkLoan(req.body);
  if (error) return res.status(400).json({ error });
  const { friendName, amount, dueDate } = req.body;
  const result = await pool.query(
    `insert into loans (user_id, friend_name, amount, due_date, receipt)
     values ($1, $2, $3, $4, $5) returning ${loanFields}`,
    [req.userId, friendName.trim(), amount, dueDate, req.file ? req.file.filename : null]
  );
  res.status(201).json(result.rows[0]);
}));

app.post("/loans/:id/repay", wrap(auth), wrap(async (req: any, res: Response) => {
  const result = await pool.query(
    `update loans set repaid = true where id = $1 and user_id = $2 returning ${loanFields}`,
    [req.params.id, req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: "Loan not found" });
  res.json(result.rows[0]);
}));

app.get("/summary", wrap(auth), wrap(async (req: any, res: Response) => {
  const result = await pool.query(
    `select
      coalesce(sum(amount), 0)::float8 as "totalLent",
      coalesce(sum(amount) filter (where repaid), 0)::float8 as "totalRepaid",
      coalesce(sum(amount) filter (where not repaid and due_date < current_date), 0)::float8 as "overdueAmount"
     from loans where user_id = $1`,
    [req.userId]
  );
  res.json(result.rows[0]);
}));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  res.status(500).json({ error: "Server error" });
});

setup()
  .then(() => app.listen(4000, () => console.log("Server running on port 4000")))
  .catch((e) => console.log("Could not start, is Postgres running?", e.message));
