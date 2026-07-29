const Joi = require("joi");

const registerSchema =Joi.object({
 name: Joi.string()
    .min(3)
    .max(30)
    .required(),
    
  email: Joi.string()
    .email()
    .required(),
   
  password: Joi.string()
    .min(6)
    .required(),
    
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