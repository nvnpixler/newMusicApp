const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    const singer_banks = sequelize.define('singer_banks', {
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
        bank_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: ''
        },
        account_holder_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        account_number: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        ifsc_code: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        branch_address: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: ''
        },
        status: {
            type: DataTypes.ENUM("0", "1"),
            allowNull: false,
            defaultValue: "1",
            comment: "0=inactive, 2=active"
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
        tableName: 'singer_banks',
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

    singer_banks.associate = models => {
        singer_banks.belongsTo(models.users, { foreignKey: 'user_id', hooks: false });
    };

    // Sync the model with the database
    singer_banks.sync()
        .then(() => {
            console.log('table created successfully.');
        })
        .catch((error) => {
            console.error('Error creating table:', error.message);
        });

    return singer_banks;
};
