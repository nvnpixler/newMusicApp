const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    const video_add_lib = sequelize.define('video_add_lib', {
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
        is_add: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
            defaultValue: 1,
            comment: "0=not added , 1=added"
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
        tableName: 'video_add_lib',
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

    video_add_lib.associate = models => {
        video_add_lib.belongsTo(models.users, { foreignKey: 'user_id', hooks: false });
        video_add_lib.belongsTo(models.video_details, { foreignKey: 'video_id', hooks: false });
    };

    // video_add_lib.sync()
    // .then(() => {
    //     console.log('table created successfully.');
    // })
    // .catch((error) => {
    //     console.error('Error creating table:', error);
    // });


    return video_add_lib;
};
