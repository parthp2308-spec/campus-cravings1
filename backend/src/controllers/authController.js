const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const env = require('../config/env');
const userModel = require('../models/userModel');
const ApiError = require('../utils/ApiError');

function signToken(user) {
  return jwt.sign(
    {
      role: user.role,
      email: user.email
    },
    env.jwtSecret,
    {
      subject: user.id,
      expiresIn: env.jwtExpiresIn
    }
  );
}

async function register(req, res, next) {
  const { name, email, password, role = 'student' } = req.body;

  if (!['student', 'restaurant', 'admin'].includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }

  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await userModel.createUser({
    name,
    email,
    passwordHash,
    role
  });

  const token = signToken(user);

  return res.status(201).json({
    user,
    token
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = signToken(user);

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    },
    token
  });
}

module.exports = {
  register,
  login
};
