const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 3000;

// กำหนดค่าการเชื่อมต่อ MySQL โดยตรง (ไม่ใช้ .env)
const db = mysql.createConnection({
  host: "localhost",  // เปลี่ยนเป็นที่อยู่เซิร์ฟเวอร์ MySQL ถ้าไม่ใช่ localhost
  user: "root",       // เปลี่ยนเป็นชื่อผู้ใช้ MySQL ของคุณ
  password: "", // เปลี่ยนเป็นรหัสผ่านของคุณ
  database: "library", // เปลี่ยนเป็นชื่อฐานข้อมูลของคุณ
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL Connection Error:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// 📌 CRUD Routes
app.get("/items", (req, res) => {
  db.query("SELECT * FROM items", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/items", (req, res) => {
  const { name, description } = req.body;
  db.query("INSERT INTO items (name, description) VALUES (?, ?)", [name, description], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, name, description });
  });
});

app.put("/items/:id", (req, res) => {
  const { name, description } = req.body;
  db.query("UPDATE items SET name=?, description=? WHERE id=?", [name, description, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Updated successfully" });
  });
});

app.delete("/items/:id", (req, res) => {
  db.query("DELETE FROM items WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted successfully" });
  });
});

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
