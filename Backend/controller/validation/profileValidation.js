const Joi = require('joi');


const updateCandidateSchema = Joi.object({
    title: Joi.string().allow('', null),
    bio: Joi.string().allow('', null),
    skills: Joi.array().items(Joi.string()),
    experience: Joi.array().items(
        Joi.object({
            company: Joi.string(),
            position: Joi.string(),
            startDate: Joi.date().allow(null),
            endDate: Joi.date().allow(null),
            description: Joi.string().allow('', null),
        })
    ),
    education: Joi.array().items(
        Joi.object({
            institution: Joi.string(),
            degree: Joi.string(),
            fieldOfStudy: Joi.string(),
            graduationYear: Joi.number().integer().min(1900).max(2100),
        })
    ),
    socialLinks: Joi.object({
        linkedin: Joi.string().uri().allow('', null),
        github: Joi.string().uri().allow('', null),
        portfolio: Joi.string().uri().allow('', null),
        website: Joi.string().uri().allow('', null),
    }),
    dateOfBirth: Joi.date().allow(null),
    isActive: Joi.boolean(),
});


const updateCompanySchema = Joi.object({
    companyName: Joi.string().min(2),
    industry: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
    website: Joi.string().uri().allow('', null),
    companySize: Joi.string().allow('', null),
    logoUrl: Joi.string().uri().allow('', null),
    foundedYear: Joi.number().integer().min(1800).max(new Date().getFullYear()).allow(null),
    // isVerified is deliberately NOT here: a company must not be able to grant
    // itself the verified badge. It is toggled only via the admin verify route.
});


const userIdSchema = Joi.object({
    id: Joi.string().hex().length(24).required() 
});

module.exports = {
    updateCandidateSchema,
    updateCompanySchema,
    userIdSchema
};
