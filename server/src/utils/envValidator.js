/**
 * Validates essential environment variables on server start
 */
export const validateEnv = () => {
  const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'CLIENT_URL',
  ];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ CRITICAL ERROR: Missing required environment variables: ${missing.join(', ')}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  } else {
    console.log('✅ Required environment variables validated successfully');
  }

  // Warn about placeholder values in other variables
  const placeholders = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'SMTP_USER',
    'SMTP_PASS',
  ];

  const activePlaceholders = placeholders.filter(
    (key) => process.env[key] && process.env[key].includes('your_')
  );

  if (activePlaceholders.length > 0) {
    console.warn(
      `⚠️ WARNING: The following variables still contain default placeholder values: ${activePlaceholders.join(', ')}. Please update them before deploying to production.`
    );
  }
};
