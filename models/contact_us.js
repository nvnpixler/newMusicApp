const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    const contact_us = sequelize.define('contact_us', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: '',
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: '',
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: '',
        },
        // created_at: {
        // 	type: DataTypes.DATE,
        // 	allowNull: true,
        // 	defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        // },
        // updated_at: {
        // 	type: DataTypes.DATE,
        // 	allowNull: true,
        // 	defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        // }
    }, {
        sequelize,
        tableName: 'contact_us',
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
    contact_us.sync()
        .then(() => {
            console.log('table created successfully.');
        })
        .catch((error) => {
            console.error('Error creating table:', error);
        });
    return contact_us;
};
