const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { registerSchema, loginSchema } = require("./validation/authValidation");

const register = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) return res.status(400).json({
            msg: error.details.map((err) => err.message),
        });

        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        res.status(201).json({
            message: "User registered successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({
            msg: error.message
        });
    }
};


//Login 
const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password)
            return res.status(400).json({
                msg: "Invalid Email or Password"
            });

        const user = await User.findOne({ email });

        if (!user)
            return res.status(404).json({
                msg: "Your Account Not Found Please Create Account"
            });

        const matchPassword = await bcrypt.compare(password, user.password);

        if (!matchPassword)
            return res.status(400).json({
                msg: "Invalid Email or Password"
            });


        const token = jwt.sign({
            id: user._id,
            role: user.role
        },
            process.env.JWT_SECRET,
            { expiresIn: "1d" })


        res.status(200).json({
            msg: "Successful Login",
            token,
        })


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