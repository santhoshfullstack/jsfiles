import User from './userModel';
import {sequelize} from '../config/database';

const dbInit = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');
    await sequelize.sync({ force: false }); // Set to `false` in production
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  // try {
  //   await slaveSequelize.authenticate();
  //   console.log('Database slave connected...');
  //   await slaveSequelize.sync({ force: false }); // Set to `false` in production
  // } catch (error) {
  //   console.error('Unable to connect to the slave database:', error);
  // }
};

export default dbInit;
