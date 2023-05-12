const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    const pages = sequelize.define('pages', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true
        },
        slug: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
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
        tableName: 'pages',
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

            // Sync the model with the database
            pages.sync()
            .then(() => {
                console.log('table created successfully.');
            })
            .catch((error) => {
                console.error('Error creating table:', error);
            });
    // pages.associate = models => {
	// 	pages.hasOne(models.user_details, { foreignKey: 'user_id', hooks: false });
	// };

  return pages;
};
