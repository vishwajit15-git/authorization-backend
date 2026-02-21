const jwt = require("jsonwebtoken");

module.exports.authMiddleware=(req,res,next)=>{
    const authHeader=req.headers.authorization;

     if (!authHeader) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        //there are 3 reasons we do the above line
        //A. Passing User Identity Forward---> we do this becoz the bakcend knows that this user is verified and now they can access everything within there limits.If we don’t attach to req, the route handler has no idea:---->1.Who the user is   2.What role they have     3.What userId they have
        //B.Avoid Re-Verifying Token--->If we didn’t attach to req: Every route would need to:   1.Extract token     2.Verify token again   3.Decode again.      That’s duplication.
        //C.Clean Separation of Responsibility.
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
}