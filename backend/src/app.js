const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const apiRateLimiter = require('./middleware/rateLimiter');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const paymentController = require('./controllers/paymentController');
const asyncHandler = require('./utils/asyncHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), asyncHandler(paymentController.handleWebhook));

app.use(express.json());
app.use('/api', apiRateLimiter);

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
