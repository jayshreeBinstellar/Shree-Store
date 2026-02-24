const express = require("express");
require("dotenv").config();
const cors = require("cors");
// const multer = require("multer");

const app = express();

// DEBUG LOGGING MIDDLEWARE - Add this very first
app.use((req, res, next) => {
  console.log(`[SERVER] Incoming Request: ${req.method} ${req.url}`);
  next();
});

const paymentController = require('./controller/payment');

// Webhook needs raw body
app.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);
app.set('trust proxy', true);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed'));
//     }
//   }
// });

// Serve static files from uploads directory with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static('uploads'));

app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}));

const auth = require('./routes/auth/login');
const shop = require('./routes/shop');
const admin = require('./routes/admin');

// Make upload middleware available globally
// app.use((req, res, next) => {
//   req.upload = upload.single('image');
//   next();
// });

app.use('/auth', auth);
app.use('/shop', shop);
app.use('/admin', admin);

app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  console.log(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ status: "error", message: err.message || "Internal Server Error" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
