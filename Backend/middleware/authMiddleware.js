const jwt = require("jsonwebtoken");

// get token from req
const authMiddleware = (req, res, next)=>{
    try {
       const authHeaders = req.headers.authorization;
       if(!authHeaders)
        return res.status(401).json({
        msg: "TOken Required"
       });
       const token = authHeaders.split(" ") [1]
       const payload = jwt.verify(token, process.env.JWT_SECRET);

       req.user = {id: payload.id,
        role: payload.role};
        next();
    } catch (error) {
        return res.status(401).json({ msg: "Token Invalid"});
    }

}
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
         message: 'Access denied' });
    }
    next();
  };
};




module.exports= {
    authMiddleware,
    restrictTo,
};
