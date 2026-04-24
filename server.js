const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// =======================
// ⚙️ MIDDLEWARE
// =======================
app.use(cors({ origin: "*" }));
app.use(express.json());

// =======================
// 🔗 SUPABASE
// =======================
const supabase = createClient(
  "https://uvbfebxyvukrvpwznvny.supabase.co",
  "sb_publishable_YBS-KSM4NIR33aSJeD25fg_6uB6mEoP"
);

// =======================
// 🏠 ROOT
// =======================
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// =======================
// 👤 SAVE / UPDATE PROFILE
// =======================
app.post("/profile/update", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { username, email, phone, bio, avatar } = req.body;

    if (!username) {
      return res.json({ success: false, message: "Username wajib" });
    }

    const { error } = await supabase
      .from("profiles")
      .upsert([
        {
          username,
          email: email || "",
          phone: phone || "",
          bio: bio || "",
          avatar: avatar || ""
        }
      ]);

    if (error) {
      console.log("ERROR:", error);
      return res.json({ success: false, message: error.message });
    }

    res.json({ success: true });

  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.json({ success: false, message: "Server error" });
  }
});

// =======================
// 📥 GET PROFILE
// =======================
app.get("/profile/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .maybeSingle(); // 🔥 lebih aman

    if (error) {
      return res.json({ success: false, message: error.message });
    }

    // 🔥 kalau belum ada profile → buat default
    if (!data) {
      return res.json({
        success: true,
        data: {
          username,
          email: "",
          phone: "",
          bio: "",
          avatar: ""
        }
      });
    }

    res.json({ success: true, data });

  } catch (err) {
    res.json({ success: false, message: "Server error" });
  }
});

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
        role: data[0].role
      });
    }

    res.json({ success: false, message: "Login salah" });

  } catch {
    res.json({ success: false, message: "Server error" });
  }
});

// =======================
// 📝 REGISTER
// =======================
app.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const { data: existing } = await supabase
      .from("pass")
      .select("*")
      .eq("username", username);

    if (existing && existing.length > 0) {
      return res.json({
        success: false,
        message: "Username sudah dipakai"
      });
    }

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
      return res.json({ success: false, message: error.message });
    }

    res.json({ success: true });

  } catch {
    res.json({ success: false, message: "Server error" });
  }
});

// =======================
// 🔄 CHANGE PASSWORD
// =======================
app.post("/change-password", async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;

    const { data } = await supabase
      .from("pass")
      .select("*")
      .eq("username", username)
      .eq("password", oldPassword);

    if (!data || data.length === 0) {
      return res.json({
        success: false,
        message: "Password lama salah"
      });
    }

    const { error } = await supabase
      .from("pass")
      .update({ password: newPassword })
      .eq("username", username);

    if (error) {
      return res.json({ success: false, message: error.message });
    }

    res.json({ success: true });

  } catch {
    res.json({ success: false, message: "Server error" });
  }
});

// =======================
// 🚀 START SERVER
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
