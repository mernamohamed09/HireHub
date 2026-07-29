const Joi = require('joi');

// HH:mm 24-hour.
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const objectId = Joi.string().hex().length(24);

const createInterviewSchema = Joi.object({
    jobId: objectId.required(),
    candidateId: objectId.required(),
    applicationId: objectId.optional(),
    date: Joi.date().iso().required(),
    startTime: Joi.string().pattern(timePattern).required().messages({
        'string.pattern.base': 'startTime must be in HH:mm 24-hour format'
    }),
    endTime: Joi.string().pattern(timePattern).required().messages({
        'string.pattern.base': 'endTime must be in HH:mm 24-hour format'
    }),
    type: Joi.string().valid('video', 'phone', 'in-person').default('video'),
    meetingLink: Joi.string().uri().allow('', null),
    notes: Joi.string().allow('', null)
});

// All fields optional: a reschedule may change only some of them.
const updateInterviewSchema = Joi.object({
    date: Joi.date().iso(),
    startTime: Joi.string().pattern(timePattern).messages({
        'string.pattern.base': 'startTime must be in HH:mm 24-hour format'
    }),
    endTime: Joi.string().pattern(timePattern).messages({
        'string.pattern.base': 'endTime must be in HH:mm 24-hour format'
    }),
    type: Joi.string().valid('video', 'phone', 'in-person'),
    meetingLink: Joi.string().uri().allow('', null),
    notes: Joi.string().allow('', null),
    status: Joi.string().valid('scheduled', 'completed', 'cancelled', 'rescheduled')
}).min(1);

module.exports = { createInterviewSchema, updateInterviewSchema };
