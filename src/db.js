import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  'postgres://postgres:postgres@db.home.local:5432/postgres'
);

export default sequelize;
