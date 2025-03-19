const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserNew = require("../models/UserNew");

// ✅ Register User
const registerUser = async (req, res) => {
    try {
        console.log("Incoming request:", req.headers["content-type"]); // ✅ Debugging
        console.log("Received body:", req.body); // ✅ Debugging

        const { username, password, isAdmin } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        let userExists = await UserNew.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new UserNew({ username, password: hashedPassword, isAdmin });
        await newUser.save();

        res.json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: `Error registering user: ${error.message}` });
    }
};

// ✅ Login User
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await UserNew.findOne({ username });

        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Login error" });
    }
};

module.exports = { registerUser, loginUser };
