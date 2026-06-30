require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  evaluationApiUrl: process.env.EVALUATION_API_URL || 'https://api.example.com',
  evaluationApiKey: process.env.EVALUATION_API_KEY || 'dummy_token'
};
