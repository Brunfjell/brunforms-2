import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
console.log("Email user:", process.env.EMAIL_USER);
console.log("Email pass:", process.env.EMAIL_PASS ? "Loaded" : "Missing");

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


app.post("/send-email", async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    const info = await transporter.sendMail({
      from: `"Brunforms" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
