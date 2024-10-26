import { Sequelize } from "sequelize-typescript";
import User from "../models/userModel";
import mysql from 'mysql2/promise';
// Master connection
const sequelize = new Sequelize("mdb", "root", "Hemasanthosh@8884", {
  host: "127.0.0.1",
  dialect: "mysql",
  replication: {
    write: {
      host: "127.0.0.1", // Master database host
      username: "root",
      password: "Hemasanthosh@8884",
      database: "mdb", // Master database name
      port: 3306, // Port as number
    },
    read: [
      {
        host: "127.0.0.1", // Slave database host 1
        username: "root",
        password: "Hemasanthosh@8884",
        database: "sdb", // Slave 1 database name
        port: 3307, // Port as number
      },
      // Add additional slaves here if needed
    ],
  },
  pool: {
    max: 10,
    min: 0,
    idle: 10000,
  },
  models: [User],
  logging: console.log,
});

const pool = mysql.createPool({
  host: '127.0.0.1',
  database: 'sdb', // Your database name
  user: "root",
  password: "Hemasanthosh@8884",
  port: 3307, // Port as number
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;


// Slave connection specifically for manual read operations if needed
// const slaveSequelize = new Sequelize("md", "root", "Hemasanthosh@8884", {
//   host: "127.0.0.1",
//   dialect: "mysql",
//   port: 3307,
//   models: [User],
//   pool: { max: 10, idle: 30000, acquire: 60000 },
// });

// Sync only with the master instance
sequelize.sync();

// Export the sequelize instances
export { sequelize};
