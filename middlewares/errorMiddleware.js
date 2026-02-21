module.exports.errorMiddleware=(err,req,res,next)=>{
    console.log(err.message);

    const status=err.statusCode || 500;
    const message=err.message || "Internal Server Error";

    return res.status(status).json({
        message
    });
};