const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

// 🔗 Koneksi Supabase
const supabase = createClient(
  "https://uvbfebxyvukrvpwznvny.supabase.co",
  "sb_publishable_YBS-KSM4NIR33aSJeD25fg_6uB6mEoP"
);

// =======================
// 🔐 LOGIN
// =======================
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const { data, error } = await supabase
      .from("pass")
      .select("*")
      .eq("username", username)
      .eq("password", password);

    if (error) {
      return res.json({ success: false, message: error.message });
    }

    if (data && data.length > 0) {
      return res.json({
        success: true,
        username: data[0].username,
        role: data[0].role // ⬅️ kirim role ke frontend
      });
    } else {
      return res.json({
        success: false,
        message: "Login salah"
      });
    }

  } catch (err) {
    return res.json({
      success: false,
      message: "Server error"
    });
  }
});


// =======================
// 📝 REGISTER (ADMIN ONLY)
// =======================
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // cek user sudah ada
    const { data: existingUser, error: checkError } = await supabase
      .from("pass")
      .select("*")
      .eq("username", username);

    if (checkError) {
      return res.json({ success: false, message: checkError.message });
    }

    if (existingUser && existingUser.length > 0) {
      return res.json({
        success: false,
        message: "Username sudah dipakai"
      });
    }

    // insert user baru (default role = user kalau tidak dikirim)
    const { error } = await supabase
      .from("pass")
      .insert([
        {
          username,
          password,
          role: role || "user"
        }
      ]);

    if (error) {
      return res.json({
        success: false,
        message: error.message
      });
    }

    return res.json({
      success: true,
      message: "User berhasil dibuat"
    });

  } catch (err) {
    return res.json({
      success: false,
      message: "Server error"
    });
  }
});


// =======================
// 🔄 CHANGE PASSWORD
// =======================
app.post("/change-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  try {
    // cek password lama
    const { data, error } = await supabase
      .from("pass")
      .select("*")
      .eq("username", username)
      .eq("password", oldPassword);

    if (error) {
      return res.json({ success: false, message: error.message });
    }

    if (!data || data.length === 0) {
      return res.json({
        success: false,
        message: "Password lama salah"
      });
    }

    // update password baru
    const { error: updateError } = await supabase
      .from("pass")
      .update({ password: newPassword })
      .eq("username", username);

    if (updateError) {
      return res.json({
        success: false,
        message: updateError.message
      });
    }

    return res.json({
      success: true,
      message: "Password berhasil diubah"
    });

  } catch (err) {
    return res.json({
      success: false,
      message: "Server error"
    });
  }
});


// =======================
// 🚀 START SERVER
// =======================
app.listen(3000, () => {
  console.log("Server jalan di http://localhost:3000");
});