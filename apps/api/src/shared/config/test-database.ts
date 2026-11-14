import './env.js';

// Integration tests require an explicit local target, never the application DB.
export const checkoutTestDatabaseUrl = process.env.CHECKOUT_TEST_DATABASE_URL;
