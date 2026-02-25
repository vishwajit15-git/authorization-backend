const doctorService = require("../services/doctorService");

const createDoctor = async (req, res) => {
    const doctor = await doctorService.createDoctor(req.body, req.user);

    return res.status(201).json({
        message: "Doctor created successfully",
        doctor
    });
};

const getDoctors = async (req, res) => {
    const doctors = await doctorService.getDoctors(req.user);

    return res.status(200).json({ doctors });
};

module.exports = {
    createDoctor,
    getDoctors
};