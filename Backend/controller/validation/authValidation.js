const Joi = require("joi");

const passwordComplexity = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .message('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.')
  .required();

const registerSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(30)
    .required(),
    
  email: Joi.string()
    .email()
    .required(),
   
  password: passwordComplexity,
    
  // Public registration must never mint an admin. Admin accounts are created by
  // an existing admin via POST /api/users (restrictTo("admin")) or a seed script.
  role: Joi.string()
    .valid("candidate", "company")
    .default("candidate")

});



const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .required(),
});

module.exports = {
  registerSchema,
  loginSchema
};