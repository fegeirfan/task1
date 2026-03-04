import express from "express";
import midtransClient from "midtrans-client";
import { authenticateToken } from "../middleware/auth.js";
// import dotenv  from "dotenv";
// dotenv.config();
const router = express.Router();

// Inisialisasi Midtrans Snap
const snap = new midtransClient.Snap({
  isProduction: false, // ← false = sandbox
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

// POST /payment/create — buat transaksi baru
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const { orderId, amount, itemName } = req.body;

    if (!orderId || !amount || !itemName) {
      return res.status(400).json({ message: "orderId, amount, itemName wajib diisi" });
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,         
        gross_amount: amount,     
      },
      item_details: [
        {
          id: "item-01",
          price: amount,
          quantity: 1,
          name: itemName,
        },
      ],
      customer_details: {
        email: req.user.email,     // ambil dari JWT token
      },
    };

    const transaction = await snap.createTransaction(parameter);

    res.status(201).json({
      token: transaction.token,           // ← token untuk Snap popup
      redirect_url: transaction.redirect_url, // ← atau redirect langsung
    });

  } catch (err) {
    console.error("Midtrans error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /payment/notification — webhook dari Midtrans
router.post("/notification", async (req, res) => {
  try {
    const apiClient = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const notification = await apiClient.transaction.notification(req.body);

    const { order_id, transaction_status, fraud_status } = notification;

    console.log(`Notifikasi masuk — Order: ${order_id}, Status: ${transaction_status}`);

    // Logic update status transaksi
    if (transaction_status === "capture") {
      if (fraud_status === "accept") {
        console.log(`✅ Order ${order_id} BERHASIL dibayar`);
        // → update status di database kamu di sini
      }
    } else if (transaction_status === "settlement") {
      console.log(`✅ Order ${order_id} SETTLEMENT`);
    } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
      console.log(`❌ Order ${order_id} GAGAL: ${transaction_status}`);
    } else if (transaction_status === "pending") {
      console.log(`⏳ Order ${order_id} PENDING`);
    }

    res.status(200).json({ message: "Notifikasi diterima" });

  } catch (err) {
    console.error("Notification error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /payment/status/:orderId — cek status transaksi
router.get("/status/:orderId", authenticateToken, async (req, res) => {
  try {
    const apiClient = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const status = await apiClient.transaction.status(req.params.orderId);
    res.json(status);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;