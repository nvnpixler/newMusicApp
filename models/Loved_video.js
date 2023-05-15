const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    const loved_video = sequelize.define('loved_video', {
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
        video_id: {
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
        tableName: 'loved_video',
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

    loved_video.associate = models => {
        loved_video.belongsTo(models.users, { foreignKey: 'user_id', hooks: false });
        loved_video.belongsTo(models.video_details, { foreignKey: 'video_id', hooks: false });
    };

    // loved_video.sync()
    // .then(() => {
    //     console.log('table created successfully.');
    // })
    // .catch((error) => {
    //     console.error('Error creating table:', error);
    // });


    return loved_video;
};
