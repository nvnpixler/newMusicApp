
const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    const popil_pick_songs = sequelize.define('popil_pick_songs', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true
        },
        popil_pick_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        song_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
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
        tableName: 'popil_pick_songs',
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

        // popil_pick_songs.sync()
        // .then(() => {
        //     console.log('Table created successfully.');
        // })
        // .catch((error) => {
        //     console.error('Error creating table:', error.message);
        // });

     popil_pick_songs.associate = models => {
     	popil_pick_songs.belongsTo(models.songs, { foreignKey: 'song_id', hooks: false });
    	popil_pick_songs.belongsTo(models.popil_picks, { foreignKey: 'popil_pick_id', hooks: false });
     };



    return popil_pick_songs;
};
