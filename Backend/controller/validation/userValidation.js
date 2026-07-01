const Joi = require('joi');

const updateProfileSchema = Joi.object({
    name: Joi.string().min(3).max(50),
    phone: Joi.string().min(10).max(15),
    location: Joi.string().max(100),
    profileImage: Joi.string().uri()
});

const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
});

const userIdSchema = Joi.object({
    id: Joi.string().hex().length(24).required()
});

module.exports = {
    updateProfileSchema,
    changePasswordSchema,
    userIdSchema
};