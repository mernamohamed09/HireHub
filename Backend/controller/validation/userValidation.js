const Joi = require('joi');

const updateProfileSchema = Joi.object({
    name: Joi.string().min(3).max(50),
    phone: Joi.string().pattern(/^[+()\d\s.-]{7,25}$/).allow(''),
    location: Joi.string().max(100).allow(''),
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
