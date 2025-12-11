import { body } from "express-validator";

export const registerValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("role")
    .isIn(["user", "volunteer", "admin"])
    .withMessage("Invalid role"),
  body("homeLocation").optional().custom((val) => {
    if (val && (isNaN(Number(val.latitude)) || isNaN(Number(val.longitude)))) {
      throw new Error("homeLocation.latitude & longitude must be numbers");
    }
    return true;
  }),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

console.log("✅ validators.js loaded");
