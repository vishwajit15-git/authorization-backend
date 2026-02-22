const express=require("express");
const router=express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {authMiddleware}=require("../middlewares/authMiddleware");
const ExpressError = require("../utils/ExpressError");
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/User");
const { roleMiddleware } = require("../middlewares/roleMiddleware");

router.get(
    "/admin",
    authMiddleware,
    roleMiddleware("admin"),
    (req, res) => {
        res.json({ message: "Welcome Admin" });
    }
);

const users = [];

router.post("/register", wrapAsync(async (req, res) => {
        const { email, password } = req.body;

        //Validate input
        if (!email || !password) {
            throw new ExpressError("Email and password are required",400);
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Add user in database
        await User.create({
                email,
                password: hashedPassword
            });

        //Return success
        return res.status(201).json({
            message: "User registered successfully"
        });

    }));

    router.post("/login", wrapAsync(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ExpressError("Email and password required", 400);
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw new ExpressError("Invalid Credentials", 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new ExpressError("Invalid Credentials", 401);
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        return res.status(200).json({ token });
    }));

router.get("/profile",authMiddleware,(req,res)=>{
    return res.status(200).json({
        message:"Profile accessed",
        user:req.user
    })
});

router.get("/admin",authMiddleware,roleMiddleware("admin"),(req, res) => {
        res.json({ message: "Welcome Admin" });
    }
);

module.exports=router;