const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const geminiRoutes = require('./routes/gemini');
const suggestionsRoutes = require('./routes/suggestions');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/suggestions', suggestionsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Smart Risk Prediction API is running!' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log('Server running on http://localhost:' + process.env.PORT);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });
