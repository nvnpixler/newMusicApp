const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    const user_languages = sequelize.define('user_languages', {
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
        language_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("0", "1"),
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
        tableName: 'user_languages',
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

    user_languages.associate = models => {
        user_languages.belongsTo(models.languages, { foreignKey: 'language_id', hooks: false });
        user_languages.belongsTo(models.users, { foreignKey: 'user_id', hooks: false });
    };


    return user_languages;
};
