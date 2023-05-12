const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    const notifications = sequelize.define('notifications', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true
        },
        sender_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        receiver_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        song_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        message: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        is_read: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
            defaultValue: 0,
            comment: "0=not read, 1= read"
        },
        type: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
            defaultValue: 1,
            comment: "1"
        },
        created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
		}
    }, {
        sequelize,
        tableName: 'notifications',
        timestamps: false,
        indexes: [
        {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [
            { name: "id" },
            ]
        },
        ],
    });

    notifications.associate = models => {
		notifications.belongsTo(models.users, { foreignKey: 'sender_id', hooks: false, as : 'sender' });
		notifications.belongsTo(models.users, { foreignKey: 'receiver_id', hooks: false, as : 'receiver' });
		notifications.belongsTo(models.songs, { foreignKey: 'song_id', hooks: false });
	};

    
    // notifications.sync()
    // .then(() => {
    //     console.log('table created successfully.');
    // })
    // .catch((error) => {
    //     console.error('Error creating table:', error);
    // });
  return notifications;
};
