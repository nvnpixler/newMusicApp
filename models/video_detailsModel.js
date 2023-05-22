const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    const video_details = sequelize.define('video_details', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: true,
            primaryKey: true
        },
        category_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        genres_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        artist: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        director: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: "",
        },
        producer: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: "",
        },
        price: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: '0',
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        duration: {
            type: DataTypes.STRING(5),
            allowNull: true,
            defaultValue: "0",
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: '',
        },
        videoURL: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: "null",
        },
        subTitleURL: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: "null",
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
        tableName: 'video_details',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: false,
                using: "BTREE",
                fields: [
                    { name: "id" },
                ]
            },
        ],
    });

    video_details.associate = models => {
        video_details.belongsTo(models.users, { foreignKey: 'user_id', hooks: false });
        video_details.belongsTo(models.categories, { foreignKey: 'category_id', hooks: false });
        video_details.belongsTo(models.genres, { foreignKey: 'genres_id', hooks: false });
    };

    // video_details.sync()
    // .then(() => {
    //     console.log('table created successfully.');
    // })
    // .catch((error) => {
    //     console.error('Error creating table:', error);
    // });

    return video_details;
};
