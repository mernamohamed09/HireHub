const Joi = require('joi');

const createAssessmentSchema = Joi.object({
    title: Joi.string().trim().min(3).max(120).required(),
    duration: Joi.number().integer().min(5).max(300).required(),
    passingScore: Joi.number().integer().min(1).max(100).required(),
    questions: Joi.array().items(
        Joi.object({
            type: Joi.string().valid('mcq', 'truefalse', 'written', 'coding').required(),
            text: Joi.string().trim().min(1).required(),
            maxScore: Joi.number().positive().required(),
            options: Joi.array().items(Joi.string().allow('')).optional(),
            correctAnswer: Joi.any().optional(),
            modelAnswer: Joi.string().allow('').optional(),
            allowedLanguages: Joi.array().items(Joi.string()).optional(),
            codeTemplate: Joi.string().allow('').optional(),
            testCases: Joi.array().items(
                Joi.object({
                    input: Joi.string().allow('').optional(),
                    expectedOutput: Joi.string().allow('').optional()
                })
            ).optional()
        }).unknown(true)
    ).min(1).required()
}).unknown(true);

module.exports = {
    createAssessmentSchema
};
