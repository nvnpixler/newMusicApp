const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    const playlist_songs = sequelize.define('playlist_songs', {
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
        playlist_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        song_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        status: {
            type: DataTypes.INTEGER(1),
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
        tableName: 'playlist_songs',
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

    playlist_songs.associate = models => {
        playlist_songs.belongsTo(models.users, { foreignKey: 'user_id', hooks: false });
        playlist_songs.belongsTo(models.playlists, { foreignKey: 'playlist_id', hooks: false });
        playlist_songs.belongsTo(models.songs, { foreignKey: 'song_id', hooks: false });
    };



    return playlist_songs;
};
