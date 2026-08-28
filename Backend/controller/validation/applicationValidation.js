const Joi = require('joi');

const applyJobSchema = Joi.object({
    notes: Joi.string()
        .max(500)
        .allow('')
        .optional()
});

const updateApplicationStatusSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'reviewed', 'accepted', 'rejected')
        .required()
        .messages({
            'any.only': 'Status must be one of: pending, reviewed, accepted, rejected',
            'any.required': 'Status is required'
        })
});


const applicationIdSchema = Joi.object({
    id: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'string.hex': 'Application ID must be a valid hex string',
            'string.length': 'Application ID must be exactly 24 characters',
            'any.required': 'Application ID is required'
        })
});

module.exports = {
    applyJobSchema,
    updateApplicationStatusSchema,
    applicationIdSchema
};