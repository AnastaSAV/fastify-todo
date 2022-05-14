import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import User from './User';

class Project extends Model {}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      nullable: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      nullable: false,
    },
    description: {
      type: DataTypes.STRING,
      nullable: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'projects',
    timestamps: false,
  }
);

export default Project;
