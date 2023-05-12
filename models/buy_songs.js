const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    const buy_songs = sequelize.define('buy_songs', {
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
        song_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        transaction_id: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        price: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        payment_status: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
            defaultValue: 1,
            comment: "0=not, 1=yes"
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
        tableName: 'buy_songs',
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

    buy_songs.associate = models => {
        buy_songs.belongsTo(models.users, { foreignKey: 'user_id', hooks: false });
        buy_songs.belongsTo(models.songs, { foreignKey: 'song_id', hooks: false });
    };

    return buy_songs;
};
