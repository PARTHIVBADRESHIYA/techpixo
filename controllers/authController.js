import Admin from "../model/Admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (admin) => {
    return jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// ✅ Helper for cookie options
const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";

    let cookieDomain;
    if (process.env.BASE_URL?.includes("techpixo.onrender.com")) {
        cookieDomain = "techpixo.onrender.com";
    } else if (process.env.BASE_URL?.includes("techpixo.com")) {
        cookieDomain = ".techpixo.com";
    } else {
        cookieDomain = "localhost";
    }

    return {
        httpOnly: true,
        secure: isProduction, // true for HTTPS (Render)
        sameSite: isProduction ? "None" : "Lax", // None for cross-site cookies
        domain: cookieDomain, // 🔥 Works for Render + Custom Domain + Localhost
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
};


// 📝 Register Admin
export const adminRegister = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await Admin.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        const token = generateToken(newAdmin);

        // 🍪 Cookie
        res.cookie("admin_token", token, getCookieOptions());

        res.status(201).json({
            message: "Admin registered successfully",
            admin: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role,
            },
        });
    } catch (err) {
        console.error("Admin Register Error:", err);
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
};

// 🔑 Login Admin
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateToken(admin);

        // 🍪 Cookie
        res.cookie("admin_token", token, getCookieOptions());

        res.status(200).json({
            message: "Login successful",
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (err) {
        console.error("Admin Login Error:", err);
        res.status(500).json({ message: "Login failed", error: err.message });
    }
};

// 🚪 Logout Admin
export const adminLogout = async (req, res) => {
    try {
        res.clearCookie("admin_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            domain: process.env.NODE_ENV === "production" ? ".techpixo.com" : "localhost",
        });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        console.error("Logout Error:", err);
        res.status(500).json({ message: "Logout failed", error: err.message });
    }
};
