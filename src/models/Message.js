import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import User from './User';

class Message extends Model {}

Message.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			nullable: false,
			autoIncrement: true,
		},
		message: {
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
		author: {
			type: DataTypes.STRING,
			references: {
				model: User,
				key: 'username',
			},
			nullable: false,
		},
	},
	{
		sequelize,
		tableName: 'messages',
		timestamps: false,
	}
	);
	
	export default Message;
	