const Joi = require('joi');

const passwordComplexity = Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.')
    .required();

const updateProfileSchema = Joi.object({
    name: Joi.string().min(3).max(50),
    phone: Joi.string().pattern(/^[+()\d\s.-]{7,25}$/).allow(''),
    location: Joi.string().max(100).allow(''),
    profileImage: Joi.string().uri()
});

const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: passwordComplexity
});

const adminCreateUserSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: passwordComplexity,
    role: Joi.string().valid('candidate', 'company', 'admin').default('candidate')
});

const userIdSchema = Joi.object({
    id: Joi.string().hex().length(24).required()
});

module.exports = {
    updateProfileSchema,
    changePasswordSchema,
    userIdSchema,
    adminCreateUserSchema,
    passwordComplexity
};
