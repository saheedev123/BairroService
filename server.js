const cors = require("cors");

const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const multer = require("multer");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = process.env.DATA_DIR || __dirname;

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const usersFile = path.join(dataDir, "users.json");
const uploadsDir = path.join(dataDir, "uploads");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Make uploaded pictures publicly accessible
app.use("/uploads", express.static(uploadsDir));

app.use(express.json({ limit: "1mb" }));
app.use(cors());
// Configure profile picture uploads
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadsDir);
    },

    filename: (req, file, callback) => {
        const extensions = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp"
        };

        const extension = extensions[file.mimetype];

        callback(null, crypto.randomUUID() + extension);
    }
});

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return callback(
                new Error("Only JPG, PNG and WEBP images are allowed.")
            );
        }

        callback(null, true);
    }
});

// Read registered users
function readUsers() {
    if (!fs.existsSync(usersFile)) {
        return [];
    }

    return JSON.parse(fs.readFileSync(usersFile, "utf8"));
}

// Save registered users
function saveUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Check whether a user has a valid login token
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Please log in first."
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                message: "Your login session is invalid or expired."
            });
        }

        req.userId = decoded.id;
        next();
    });
}

// Test the backend
app.get("/", (req, res) => {
    res.send("Welcome to the BairroServices Backend!");
});

app.get("/api/status", (req, res) => {
    res.json({
        message: "BairroServices backend is running!",
        status: "success"
    });
});

// Register a new user
app.post("/api/register", async (req, res) => {
    try {
        const {
            fullname,
            email,
            phone,
            neighborhood,
            accountType,
            profession,
            businessName,
            businessCategory,
            businessDescription,
            password
        } = req.body;

        // Check required information
        if (!fullname || !email || !phone || !neighborhood || !password) {
            return res.status(400).json({
                message: "Please complete all required fields."
            });
        }

        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters."
            });
        }

        if (!["professional", "business"].includes(accountType)) {
            return res.status(400).json({
                message: "Please select a valid account type."
            });
        }

        if (accountType === "professional" && !profession) {
            return res.status(400).json({
                message: "Please select your profession."
            });
        }

        if (accountType === "business" &&
            (!businessName || !businessCategory)) {
            return res.status(400).json({
                message: "Please provide your business name and category."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const users = readUsers();

        // Prevent duplicate email registrations
        const existingUser = users.find(
            user => user.email === normalizedEmail
        );

        if (existingUser) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = {
            id: Date.now().toString(),
            fullname: fullname.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            neighborhood: neighborhood.trim(),
            accountType,
            profession: accountType === "professional" ? profession : "",
            businessName: accountType === "business" ? businessName.trim() : "",
            businessCategory: accountType === "business" ? businessCategory : "",
            businessDescription: accountType === "business"
                ? (businessDescription || "")
                : "",
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        // Never send the password hash to the browser
        res.status(201).json({
            message: "Registration successful!",
            user: {
                id: newUser.id,
                fullname: newUser.fullname,
                email: newUser.email,
                accountType: newUser.accountType
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Something went wrong during registration."
        });
    }
});



// Login an existing user
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter your email and password."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const users = readUsers();

        const user = users.find(
            item => item.email === normalizedEmail
        );

        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Incorrect email or password."
            });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful!",
            token,
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                neighborhood: user.neighborhood,
                accountType: user.accountType,
                profession: user.profession,
                businessName: user.businessName,
                businessCategory: user.businessCategory
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Something went wrong during login."
        });
    }
});

// Verify the logged-in user's identity
app.get("/api/me", authenticateToken, (req, res) => {
    try {
        const users = readUsers();

        const user = users.find(
            item => item.id === req.userId
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        // Never send the password hash to the browser
        const { password, ...safeUser } = user;

        res.json({
            message: "Authentication successful!",
            user: safeUser
        });

    } catch (error) {
        console.error("Authentication error:", error);

        res.status(500).json({
            message: "Could not verify your account."
        });
    }
});


// Update and permanently save a professional's profile
app.put("/api/profile", authenticateToken, (req, res) => {
    try {
        const {
            fullName,
            phone,
            neighborhood,
            profession,
            experience,
            serviceDescription
        } = req.body;

        // Check required profile information
        if (
            typeof fullName !== "string" ||
            !fullName.trim() ||
            typeof phone !== "string" ||
            !phone.trim() ||
            typeof neighborhood !== "string" ||
            !neighborhood.trim() ||
            typeof profession !== "string" ||
            !profession.trim()
        ) {
            return res.status(400).json({
                message: "Please complete your name, phone, neighbourhood and profession."
            });
        }

        // Check optional fields are strings
        if (
            (experience !== undefined && typeof experience !== "string") ||
            (serviceDescription !== undefined && typeof serviceDescription !== "string")
        ) {
            return res.status(400).json({
                message: "Invalid profile information."
            });
        }

        const users = readUsers();

        // Find the account belonging to the logged-in user
        const userIndex = users.findIndex(
            item => item.id === req.userId
        );

        if (userIndex === -1) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const user = users[userIndex];

        // Only professional accounts can use this route
        if (user.accountType !== "professional") {
            return res.status(403).json({
                message: "This feature is only available to professionals."
            });
        }

        // Update the professional's information
        user.fullname = fullName.trim();
        user.phone = phone.trim();
        user.neighborhood = neighborhood.trim();
        user.profession = profession.trim();
        user.experience = (experience || "").trim();
       user.serviceDescription = (serviceDescription || "").trim();

// Mark profile as complete
user.profileComplete = Boolean(
    user.fullname &&
    user.phone &&
    user.neighborhood &&
    user.profession &&
    user.experience &&
    user.serviceDescription
);

// Permanently save changes in users.json
saveUsers(users);
        // Return updated information without the password
        const { password, ...safeUser } = user;

        res.json({
            message: "Your professional profile has been saved successfully!",
            user: safeUser
        });

    } catch (error) {
        console.error("Profile update error:", error);

        res.status(500).json({
            message: "Could not save your professional profile."
        });
    }
});

// Check that the logged-in account is a professional
function requireProfessional(req, res, next) {
    try {
        const users = readUsers();

        const user = users.find(item => item.id === req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        if (user.accountType !== "professional") {
            return res.status(403).json({
                message: "Only professionals can upload profile pictures."
            });
        }

        next();
    } catch (error) {
        console.error("Professional check error:", error);

        res.status(500).json({
            message: "Could not verify your account."
        });
    }
}

// Upload or replace a professional profile picture
app.post(
    "/api/profile/photo",
    authenticateToken,
    requireProfessional,
    upload.single("profilePhoto"),
    (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: "Please select a profile picture."
                });
            }

            const users = readUsers();

            const userIndex = users.findIndex(
                item => item.id === req.userId
            );

            if (userIndex === -1) {
                fs.unlinkSync(req.file.path);

                return res.status(404).json({
                    message: "User not found."
                });
            }

            const user = users[userIndex];

            // Delete the previous uploaded picture, if there is one
            if (user.photoUrl && user.photoUrl.startsWith("/uploads/")) {
                const oldFilename = path.basename(user.photoUrl);
                const oldPhotoPath = path.join(uploadsDir, oldFilename);

                if (fs.existsSync(oldPhotoPath)) {
                    fs.unlinkSync(oldPhotoPath);
                }
            }

            // Save the new picture URL in users.json
            user.photoUrl = "/uploads/" + req.file.filename;

            saveUsers(users);

            res.json({
                message: "Profile picture uploaded successfully!",
                photoUrl: user.photoUrl
            });

        } catch (error) {
            console.error("Photo upload error:", error);

            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                message: "Could not save your profile picture."
            });
        }
    }
);

// Get completed professional profiles for the public directory
app.get("/api/professionals", (req, res) => {
    try {
        const users = readUsers();

        const professionals = users
            .filter(user =>
                user.accountType === "professional" &&
                user.profileComplete === true
            )
            .map(user => {
                // Prepare the phone number for WhatsApp
                let phone = String(user.phone || "").replace(/\D/g, "");

                // Add Brazil's country code if it is missing
                if (phone.length === 10 || phone.length === 11) {
                    phone = "55" + phone;
                }

                return {
                    id: user.id,
                    fullname: user.fullname,
                    profession: user.profession,
                    neighborhood: user.neighborhood,
                    experience: user.experience,
                    serviceDescription: user.serviceDescription,
                    photoUrl: user.photoUrl || null,
                    whatsappLink: phone
                        ? `https://wa.me/${phone}`
                        : null
                };
            });

        res.json({
            message: "Professionals retrieved successfully!",
            total: professionals.length,
            professionals
        });

    } catch (error) {
        console.error("Public directory error:", error);

        res.status(500).json({
            message: "Could not retrieve professionals."
        });
    }
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`BairroServices server running on port ${PORT}`);
});
