const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    const transactions = sequelize.define('transactions', {
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
        singer_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        song_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        transaction_id: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        amount: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: '0'
        },
        payment_status: {
            type: DataTypes.ENUM("0", "1"),
            allowNull: false,
            defaultValue: "1",
            comment: "0= not compelte, 1= complete	"
        },
        payment_type: {
            type: DataTypes.ENUM("1", "2"),
            allowNull: false,
            defaultValue: "1",
            comment: "1=online, 2=cash"
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
        tableName: 'transactions',
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

    transactions.associate = models => {
        transactions.belongsTo(models.users, { foreignKey: 'user_id', hooks: false, as: 'user' });
        transactions.belongsTo(models.users, { foreignKey: 'singer_id', hooks: false, as: 'singer' });
        transactions.belongsTo(models.songs, { foreignKey: 'song_id', hooks: false });
    };
    // transactions.sync()
    // .then(() => {
    //     console.log('table created successfully.');
    // })
    // .catch((error) => {
    //     console.error('Error creating table:', error);
    // });

    return transactions;
};
