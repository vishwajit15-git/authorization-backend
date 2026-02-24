const express=require("express");
const router=express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {authMiddleware}=require("../middlewares/authMiddleware");
const ExpressError = require("../utils/ExpressError");
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/User");
const { roleMiddleware } = require("../middlewares/roleMiddleware");
const Clinic = require("../models/Clinic");
const Doctor=require("../models/Doctor");




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
            {
                id: user._id,
                clinicId: user.clinicId,
                role: user.role
            },
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



router.get("/whoami", authMiddleware, (req, res) => {
    res.json({
        id: req.user.id,
        clinicId: req.user.clinicId,
        role: req.user.role
    });
});



router.post("/register-clinic",wrapAsync(async(req,res)=>{
    const session= await mongoose.startSession();  //startSession() opens isolated workspace
    session.startTransaction();  //initializes the transaction [From this point, treat operations as atomic.]

    try{
        const {clinicName,email,password}=req.body;

        //check if all details are filled 
        if(!clinicName || !email || !password){
            throw new ExpressError("All fields required",400);
        }
        
        //create clinic
        const clinic=await Clinic.create([{
            name:clinicName
        }],{session})

        ///hash the password
        const hashedPassword=await bcrypt.hash(password,10);

        //create admin user
        const user=await User.create([{
            email,
            password:hashedPassword,
            clinicId:clinic[0]._id,
            role:"admin",
        }],{session});


        await session.commitTransaction(); //Everything went well.Make all changes permanent.
        session.endSession();//closes the isolated workspace

        const token = jwt.sign(
            {
                id: user[0]._id,
                clinicId: user[0].clinicId,
                role: user[0].role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(201).json({
            message: "Clinic registered successfully",
            token
        });
    }catch(err){
        await session.abortTransaction();//Something failed.Pretend none of this happened.
        session.endSession();
        throw err;
    }
}));


router.post("/doctors",
    authMiddleware,
    wrapAsync(async (req, res) => {

        const { name, specialization } = req.body;

        if (!name || !specialization) {
            throw new ExpressError("All fields required", 400);
        }

        console.log("req.user:", req.user);  // debug

        const doctor = await Doctor.create({
            name,
            specialization,
            clinicId: req.user.clinicId
        });

        return res.status(201).json({
            message: "Doctor created successfully",
            doctor
        });
}));

router.get("/doctors",authMiddleware,wrapAsync(async(req,res)=>{
     const doctors = await Doctor.find({
        clinicId: req.user.clinicId   // TENANT FILTER
    });

    return res.status(200).json({
        doctors
    });
}));


module.exports=router;



// START TRANSACTION

// Do Operation A
// Do Operation B

// If all good:
//     COMMIT
// Else:
//     ROLLBACK