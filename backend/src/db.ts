import { Pool } from "pg";
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/miniledger",
});
export async function setup() {
  await pool.query(`create table if not exists users (
    id serial primary key,
    phone text unique not null,
    token text
  )`);
  await pool.query(`create table if not exists loans (
    id serial primary key,
    user_id int not null references users(id),
    friend_name text not null,
    amount numeric(12,2) not null,
    due_date date not null,
    repaid boolean not null default false,
    receipt text
  )`);
}
