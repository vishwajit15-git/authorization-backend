const mongoose=require("mongoose");

const clinicSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    address:{
        type:String
    }
},{timestamps:true});

module.exports = mongoose.model("Clinic", clinicSchema);