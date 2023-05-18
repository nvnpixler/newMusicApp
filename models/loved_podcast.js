const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    const loved_podcast = sequelize.define('loved_podcast', {
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
        podcast_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        is_love: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
            defaultValue: 1,
            comment: "0=not loved, 1=loved"
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
        tableName: 'loved_podcast',
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

    loved_podcast.associate = models => {
        loved_podcast.belongsTo(models.users, { foreignKey: 'user_id', hooks: false });
        loved_podcast.belongsTo(models.songs, { foreignKey: 'podcast_id', hooks: false });
    };

    // loved_podcast.sync()
    // .then(() => {
    //     console.log('table created successfully.');
    // })
    // .catch((error) => {
    //     console.error('Error creating table:', error);
    // });


    return loved_podcast;
};
