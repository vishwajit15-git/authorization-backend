const Doctor = require("../models/Doctor");
const baseTenantService = require("./baseTenantService");

const createDoctor = async (data, user) => {
    return await baseTenantService.create(Doctor, data, user);
};

const getDoctors = async (user) => {
    return await baseTenantService.findAll(Doctor, user);
};

module.exports = {
    createDoctor,
    getDoctors
};