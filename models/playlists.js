const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    const playlists = sequelize.define('playlists', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: ''
        },
        status: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
            defaultValue: 1,
            comment: "0=inactive, 1=active"
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
        tableName: 'playlists',
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

    playlists.associate = models => {
		playlists.belongsTo(models.users, { foreignKey: 'user_id', hooks: false });
        playlists.hasMany(models.playlist_songs, { foreignKey: 'playlist_id', hooks: false });
	};

    // playlists.sync()
    // .then(() => {
    //     console.log('table created successfully.');
    // })
    // .catch((error) => {
    //     console.error('Error creating table:', error);
    // });
  return playlists;
};
