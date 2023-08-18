const { Sequelize } = require('sequelize');
const { DB_URI } = require("./config");

let sequelize = new Sequelize(DB_URI, {logging: false});

async function connect() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully: ' + DB_URI);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

async function sync(options) {
  await sequelize.sync(options);
  console.log("All models were synchronized successfully.");
}

// sync for tests happen later so we can reset tables with force sync
if (process.env.NODE_ENV !== "test") {
  connect();
  sync({ alter: true });
}

module.exports = { sequelize, connect, sync };
