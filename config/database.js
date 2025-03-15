const { Sequelize } = require("sequelize");
const config = require("./config");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions: {
      connectTimeout: 60000, // Timeout lebih lama untuk Railway
    },
    logging: false,
  }
);

module.exports = sequelize;
