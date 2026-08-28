const jwt = require("jsonwebtoken");
const User = require("../models/User");
const redis = require("../utils/redisClient");

const getUserStatus = async (userId) => {
    const cacheKey = `user:status:${userId}`;
    try {
        if (redis.status === 'ready') {
            const cached = await redis.get(cacheKey);
            if (cached) return JSON.parse(cached);
        }
    } catch {
        // Fallback gracefully to database on Redis read error
    }

    const user = await User.findById(userId).select('role isActive');
    if (!user) return null;

    const userState = { role: user.role, isActive: user.isActive };
    try {
        if (redis.status === 'ready') {
            await redis.set(cacheKey, JSON.stringify(userState), 'EX', 900); // 15 min TTL
        }
    } catch {}

    return userState;
};

// get token from req and verify active user status
const authMiddleware = async (req, res, next) => {
    try {
       const authHeaders = req.headers.authorization;
       
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
       const userState = await getUserStatus(payload.id);

       if (!userState) {
           return res.status(401).json({ msg: "User account no longer exists" });
       }

       if (userState.isActive === false) {
           return res.status(403).json({ msg: "Your account has been suspended. Please contact admin." });
       }

       req.user = {
           id: payload.id,
           role: userState.role
       };
       next();
    } catch (error) {
        return res.status(401).json({ msg: "Token Invalid or Expired" });
    }
};

const optionalAuthMiddleware = async (req, res, next) => {
    const authHeaders = req.headers?.authorization;
    if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
        req.user = null;
        return next();
    }
    try {
        const token = authHeaders.split(" ")[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const userState = await getUserStatus(payload.id);
        if (userState && userState.isActive !== false) {
            req.user = { id: payload.id, role: userState.role };
        } else {
            req.user = null;
        }
    } catch {
        req.user = null;
    }
    next();
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
    optionalAuthMiddleware,
    restrictTo,
    getUserStatus
};