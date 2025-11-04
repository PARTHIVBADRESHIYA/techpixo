// import Admin from "../model/Admin.js";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";

// // 🔐 Generate JWT
// const generateToken = (admin) => {
//     return jwt.sign(
//         { id: admin._id, role: admin.role },
//         process.env.JWT_SECRET,
//         { expiresIn: "7d" }
//     );
// };

// // 📝 Register Admin
// export const adminRegister = async (req, res) => {
//     try {
//         const { name, email, password, role } = req.body;

//         // Check existing admin
//         const existingAdmin = await Admin.findOne({ email });
//         if (existingAdmin) {
//             return res.status(400).json({ message: "Admin already exists" });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create admin
//         const newAdmin = await Admin.create({
//             name,
//             email,
//             password: hashedPassword,
//             role,
//         });

//         // Generate token
//         const token = generateToken(newAdmin);

//         res.status(201).json({
//             message: "Admin registered successfully",
//             token,
//             admin: {
//                 id: newAdmin._id,
//                 name: newAdmin.name,
//                 email: newAdmin.email,
//                 role: newAdmin.role,
//             },
//         });
//     } catch (err) {
//         console.error("Admin Register Error:", err);
//         res.status(500).json({ message: "Registration failed", error: err.message });
//     }
// };

// // 🔑 Login Admin
// export const adminLogin = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         const admin = await Admin.findOne({ email });
//         if (!admin) {
//             return res.status(401).json({ message: "Invalid email or password" });
//         }

//         // Compare password
//         const isMatch = await bcrypt.compare(password, admin.password);
//         if (!isMatch) {
//             return res.status(401).json({ message: "Invalid email or password" });
//         }

//         // Generate token
//         const token = generateToken(admin);

//         res.status(200).json({
//             message: "Login successful",
//             token,
//             admin: {
//                 id: admin._id,
//                 name: admin.name,
//                 email: admin.email,
//                 role: admin.role,
//             },
//         });
//     } catch (err) {
//         console.error("Admin Login Error:", err);
//         res.status(500).json({ message: "Login failed", error: err.message });
//     }
// };








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

// Helper for cookie options based on environment
const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProduction, // only true in production (HTTPS)
        sameSite: isProduction ? "None" : "Lax",
        domain: isProduction ? ".techpixo.com" : "localhost",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
