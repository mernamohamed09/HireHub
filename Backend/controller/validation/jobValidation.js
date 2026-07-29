const Joi = require('joi');

const createJobSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).required(),
    location: Joi.string().min(3).max(100).required(),
    salary: Joi.number().min(0).allow(null),
    company: Joi.string().min(2).max(100).required()
});

const updateJobSchema = Joi.object({
    title: Joi.string().min(3).max(100),
    description: Joi.string().min(10),
    location: Joi.string().min(3).max(100),
    salary: Joi.number().min(0).allow(null),
    company: Joi.string().min(2).max(100),
    isActive: Joi.boolean(),
    expiresAt: Joi.date()
});

const jobIdSchema = Joi.object({
    id: Joi.string().hex().length(24).required()
});

const searchJobSchema = Joi.object({
    q: Joi.string().optional(),
    location: Joi.string().optional(),
    minSalary: Joi.number().min(0).optional(),
    maxSalary: Joi.number().min(0).optional(),
    company: Joi.string().optional(),
    sort: Joi.string().valid('latest', 'oldest', 'salary-high', 'salary-low', 'title').optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(50).optional()
});

module.exports = {
    createJobSchema,
    updateJobSchema,
    jobIdSchema,
    searchJobSchema
};