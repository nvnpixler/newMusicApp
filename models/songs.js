const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    const songs = sequelize.define('songs', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
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
        price: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: '0',
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: '',
        },
        thumbnail: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: '',
        },
        image_type: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: '',
        },
        music: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: '',
        },
        status: {
            type: DataTypes.ENUM("0", "1"),
            allowNull: false,
            defaultValue: "1",
            comment: "0=inactive, 1=active"
        },
        is_hall_of_fame: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
            defaultValue: 0,
            comment: "0=not, 1=yes"
        },
        is_podcast: {
            type: DataTypes.ENUM("0", "1"),
            allowNull: false,
            defaultValue: "0",
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
        tableName: 'songs',
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


    songs.associate = models => {
        songs.belongsTo(models.users, { foreignKey: 'user_id', hooks: false });
        songs.belongsTo(models.categories, { foreignKey: 'category_id', hooks: false });
        songs.belongsTo(models.genres, { foreignKey: 'genres_id', hooks: false });
        songs.hasOne(models.popil_pick_songs, { foreignKey: 'song_id', hooks: false });
    };


    return songs;
};
