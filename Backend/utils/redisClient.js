const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 2,
  enableOfflineQueue: false,
  retryStrategy: (times) => {
    if (times > 5) {
      return null;
    }
    return Math.min(times * 200, 2000);
  },
  lazyConnect: false
});

redis.on('connect', () => {
  console.log('[Redis] Connected successfully to', REDIS_URL);
});

redis.on('error', (err) => {
  console.warn('[Redis] Connection warning (falling back to database):', err.message);
});

module.exports = redis;
