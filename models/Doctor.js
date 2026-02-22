const mongoose = require("mongoose");

const doctorSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    speciality:{
        type:String,
        required:true
    },
    clinicId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Clinic",
        required:true
    }
},{timestamps:true});

module.exports = mongoose.model("Doctor", doctorSchema);