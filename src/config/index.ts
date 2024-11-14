export default {
  dbConfig: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT,
  env: process.env.NODE_ENV,
};
