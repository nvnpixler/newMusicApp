const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    const categories = sequelize.define('categories', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true
        },
        position: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: '',
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
        tableName: 'categories',
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
        categories.sync()
        .then(() => {
            console.log('table created successfully.');
        })
        .catch((error) => {
            console.error('Error creating table:', error);
        });

    // categories.associate = models => {
	// 	categories.hasOne(models.user_details, { foreignKey: 'user_id', hooks: false });
	// };

  return categories;
};
