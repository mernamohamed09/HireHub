const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redis = require('./redisClient');

/**
 * Creates an Express rate limiter instance backed by Redis when available,
 * falling back gracefully to the built-in in-memory store if Redis is down.
 *
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of connections allowed in windowMs
 * @param {string} options.prefix - Prefix for Redis keys
 * @param {string} options.message - Error message returned on 429
 * @param {Function} [options.keyGenerator] - Optional custom key generator (e.g., req.user.id)
 * @returns {Function} Express rate limit middleware
 */
const createLimiter = ({ windowMs, max, prefix, message, keyGenerator }) => {
    const opts = {
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { msg: message },
        store: redis.status === 'ready' ? new RedisStore({
            sendCommand: (...args) => redis.call(...args),
            prefix: `rl:${prefix}:`
        }) : undefined,
        skip: (req) => {
            if (process.env.NODE_ENV === 'test') return true;
            return req.ip === '127.0.0.1' && req.path === '/api/health';
        }
    };
    if (keyGenerator) {
        opts.keyGenerator = keyGenerator;
    }
    return rateLimit(opts);
};

module.exports = { createLimiter };
