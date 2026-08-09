const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { registerSchema, loginSchema } = require("./validation/authValidation");

// دالة مساعدة لتوليد التوكن تطبيقاً لمبدأ DRY
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
};

const register = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) return res.status(400).json({
            msg: error.details.map((err) => err.message),
        });

        const { name, email, password, role } = value;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                msg: "Email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        const token = generateToken(user);

        // تجهيز كائن مستخدم نظيف وبدون كلمة المرور لإرجاعه للفرونت إند
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            location: user.location,
            profileImage: user.profileImage
        };

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: userResponse,
            token,
        });
    } catch (error) {
        res.status(500).json({
            msg: error.message
        });
    }
};


const login = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                msg: error.details.map((err) => err.message)
            });
        }

        const { email, password } = value;

        const user = await User.findOne({ email });

        // Identical response for "no such user" and "wrong password" so the
        // endpoint doesn't reveal which emails are registered.
        if (!user) {
            return res.status(401).json({ msg: "Invalid email or password" });
        }

        const matchPassword = await bcrypt.compare(password, user.password);

        if (!matchPassword) {
            return res.status(401).json({ msg: "Invalid email or password" });
        }

        if (user.isActive === false) {
            return res.status(403).json({ msg: "Your account has been suspended. Please contact admin." });
        }

        const token = generateToken(user);

        // تجهيز كائن مستخدم نظيف وبدون كلمة المرور لإرجاعه للفرونت إند
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            location: user.location,
            profileImage: user.profileImage,
            isActive: user.isActive
        };

        res.status(200).json({
            success: true,
            msg: "Successful Login",
            user: userResponse,
            token,
        });

    } catch (error) {
        res.status(500).json({
            msg: error.message
        });
    }
};

module.exports = {
    register,
    login
};