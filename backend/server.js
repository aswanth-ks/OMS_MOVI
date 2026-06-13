import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { validateEnv } from './src/config/env.js';

// Validate environment variables before anything else
validateEnv();

// Connect to MongoDB
await connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 OWMS Backend running on port ${PORT} [${process.env.NODE_ENV}]`);
});
