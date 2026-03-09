// routes/payment.js
import express from "express";
import midtransClient from "midtrans-client";
import crypto from "crypto"; // ← untuk verifikasi signature
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});


router.post("/create", authenticateToken, async (req, res) => {
  try {
    const { orderId, amount, itemName } = req.body;

    if (!orderId || !amount || !itemName) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(amount),
      },
      item_details: [
        {
          id: "item-01",
          price: Number(amount),
          quantity: 1,
          name: itemName,
        },
      ],
      customer_details: {
        email: req.user.email,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    res.status(201).json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST /payment/notification — dipanggil otomatis oleh Midtrans
router.post("/notification", async (req, res) => {
  try {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_time,
    } = req.body;

    // 1. Verifikasi signature — WAJIB untuk keamanan
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const hash = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (hash !== signature_key) {
      console.warn("⚠️ Signature tidak valid! Request diabaikan.");
      return res.status(403).json({ message: "Invalid signature" });
    }

    // 2. Tentukan status transaksi
    let finalStatus = "unknown";

    if (transaction_status === "capture") {
      finalStatus = fraud_status === "accept" ? "success" : "fraud";
    } else if (transaction_status === "settlement") {
      finalStatus = "success";
    } else if (transaction_status === "pending") {
      finalStatus = "pending";
    } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
      finalStatus = "failed";
    }

    console.log(`📩 Notifikasi Midtrans:`);
    console.log(`   Order ID  : ${order_id}`);
    console.log(`   Status    : ${finalStatus}`);
    console.log(`   Metode    : ${payment_type}`);
    console.log(`   Nominal   : Rp ${Number(gross_amount).toLocaleString("id-ID")}`);
    console.log(`   Waktu     : ${transaction_time}`);

    // 3. Simpan ke database (opsional)
    // await Transaction.findOneAndUpdate(
    //   { orderId: order_id },
    //   { status: finalStatus, paymentMethod: payment_type },
    //   { upsert: true }
    // );

    // 4. Wajib balas 200 ke Midtrans
    res.status(200).json({ message: "Notifikasi diterima" });

  } catch (err) {
    console.error("Notification error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /payment/status/:orderId
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
