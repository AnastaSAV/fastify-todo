'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        nullable: false,
        autoIncrement: true,
      },
      message: {
        type: Sequelize.STRING,
        nullable: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'id',
        },
        nullable: false,
      },
		username: {
			type: Sequelize.STRING,
			references: {
			  model: {
				 tableName: 'users',
			  },
			  key: 'username',
			},
			nullable: false,
		 },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('messages');
  },
};
