require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerJsdoc = YAML.load('./api-docs.yaml');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerJsdoc));

// Test route
app.get('/', (req, res) => {
  res.send('E-commerce API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});