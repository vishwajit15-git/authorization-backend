const Doctor = require("../models/Doctor");

//for post 
const createDoctor=async(data,user)=>{
    return await Doctor.create({
        name:data.name,
        specialization:data.specialization,
        clinicId:user.clinicId
    });
};

const getDoctors=async(user)=>{
     return await Doctor.find({
        clinicId: user.clinicId
    });
}

module.exports = {
    createDoctor,
    getDoctors
};