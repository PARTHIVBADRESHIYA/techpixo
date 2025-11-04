import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import Admin from '../model/Admin.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in env");
;


export const verifyAdmin = async (req, res, next) => {
    try {
        // ✅ Get token from cookies
        const token = req.cookies?.admin_token;

        if (!token) {
            console.warn("❌ No admin token found in cookies");
            return res.status(401).json({ message: "Unauthorized: No cookie found" });
        }

        // ✅ Verify JWT
        const decoded = jwt.verify(token, JWT_SECRET);

        // ✅ Find admin by decoded ID
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            console.warn("❌ Admin not found for decoded token");
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        // ✅ Attach admin info to request
        req.admin = admin;
        req.adminId = admin._id;
        req.isSuperAdmin = admin.role === "superadmin";

        // ✅ For activity logs or notifications
        req.user = {
            id: admin._id,
            email: admin.email,
            type: "Admin",
        };

        console.log("✅ Authenticated Admin via Cookie:", admin.email);

        next();
    } catch (err) {
        console.error("❌ JWT Cookie verification error:", err.message);
        return res.status(401).json({ message: "Invalid or expired token", error: err.message });
    }
};