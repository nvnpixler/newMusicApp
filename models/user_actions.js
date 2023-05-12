const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    const user_actions = sequelize.define('user_actions', {
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
        count: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 0
        },
        type: {
            type: DataTypes.ENUM("1", "2", "3"),
            allowNull: false,
            defaultValue: 1,
            comment: "1=play song, 2=download, 3=share"
        },
        status: {
            type: DataTypes.ENUM("0", "1"),
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
        tableName: 'user_actions',
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

    user_actions.associate = models => {
        user_actions.belongsTo(models.users, { foreignKey: 'user_id', hooks: false });
        user_actions.belongsTo(models.songs, { foreignKey: 'song_id', hooks: false });
    };

    return user_actions;
};
