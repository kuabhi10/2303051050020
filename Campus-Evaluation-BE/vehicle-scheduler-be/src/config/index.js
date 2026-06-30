require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  evaluationApiUrl: process.env.EVALUATION_BASE_URL,
  evaluationApiKey: process.env.AUTH_TOKEN,
  logApiUrl: process.env.LOG_API_URL,
  logAuthToken: process.env.LOG_AUTH_TOKEN
};
