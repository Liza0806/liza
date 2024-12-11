const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const { handleMongooseError } = require("../helpers/handleMongooseError");

const phoneRegexp = /^(\+\d{1,2}\s?)?(\(\d{1,4}\))?[0-9.\-\s]{6,}$/;

const visitSchema = new mongoose.Schema({
  date: { type: String, required: true },
  groupId: { type: String, required: true },
  eventId: { type: String, required: true },
});

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: [true, "Set password for user"] },
    phone: {
      type: String,
      match: phoneRegexp,
    },
    isAdmin: { type: Boolean, default: false },
    groups: { type: Array, default: [] }, ///
    balance: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    visits: [visitSchema],
    telegramId: {
      type: Number,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);
userSchema.post("save", handleMongooseError);

const addVisit = Joi.object({
  date: Joi.string().isoDate().required(),
  groupId: Joi.string().required(),
});

const registerSchema = Joi.object({
  name: Joi.string().required(),
  password: Joi.string().required(),
  phone: Joi.string().pattern(phoneRegexp).required(),
  groups: Joi.array().default([]),
  telegramId: Joi.number().required(),
  balance: Joi.number().default(0),
});

const loginSchema = Joi.object({
  password: Joi.string().required(),
});

const schemas = {
  registerSchema,
  loginSchema,
  addVisit,
};

const User = model("user", userSchema);

module.exports = {
  User,
  schemas,
};
