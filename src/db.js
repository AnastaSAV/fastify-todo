import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  'postgres://postgres:postgres@127.0.0.1:5432/postgres'
);

export default sequelize;
