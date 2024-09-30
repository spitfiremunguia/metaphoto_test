const OpenAI = require('openai');
require('dotenv').config();

// Initialize the OpenAI client directly with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is stored securely
});

module.exports = openai;