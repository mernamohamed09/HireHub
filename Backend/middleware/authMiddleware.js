const jwt = require("jsonwebtoken");

// get token from req
const authMiddleware = (req, res, next) => {
    try {
       const authHeaders = req.headers.authorization;
       
       // Bearer 
       if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
           return res.status(401).json({
               msg: "Token Required or Invalid Authorization Format"
           });
       }

       const token = authHeaders.split(" ")[1];
       
       if (!token) {
           return res.status(401).json({
               msg: "Token Not Found"
           });
       }

       const payload = jwt.verify(token, process.env.JWT_SECRET);

       req.user = {
           id: payload.id,
           role: payload.role
       };
       next();
    } catch (error) {
        return res.status(401).json({ msg: "Token Invalid or Expired" });
    }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
         message: 'Access denied' });
    }
    next();
  };
};

module.exports = {
    authMiddleware,
    restrictTo,
};