const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    const video_details = sequelize.define('video_details', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: true,
            primaryKey: true
        },
        category: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: "",
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: "",
        },
        discription: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: '',
        },
        language: {
            type: DataTypes.ARRAY(DataTypes.STRING(25)),
            allowNull: true,
            defaultValue: "",
        },
        duration: {
            type: DataTypes.STRING(5),
            allowNull: true,
            defaultValue: "",
        },
        videoThumnail: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: "null",
        },
        videoURL: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: "null",
        },
        genre: {
            type: DataTypes.ARRAY(DataTypes.STRING(25)),
            allowNull: true,
            defaultValue: "",
        },
        isAdult: {
            type: DataTypes.ENUM("0", "1"),
            allowNull: true,
            defaultValue: 0,
            comment: "0=inactive, 1=active"
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
        video_details.hasMany(models.transactions, { foreignKey: 'video_detail_id', hooks: false, as: 'video_detail' });
        video_details.hasOne(models.singer_banks, { foreignKey: 'video_detail_id', hooks: false });
    };

    return video_details;
};
