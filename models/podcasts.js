const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    const podcasts = sequelize.define('podcasts', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        thumbnail: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        type: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("0","1"),
            allowNull: false,
            defaultValue: "1",
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
        tableName: 'podcasts',
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

    podcasts.associate = models => {
		podcasts.belongsTo(models.users, { foreignKey: 'added_by', hooks: false });
	};
    
    podcasts.sync()
    .then(() => {
        console.log('table created successfully.');
    })
    .catch((error) => {
        console.error('Error creating table:', error);
    });


  return podcasts;
};
