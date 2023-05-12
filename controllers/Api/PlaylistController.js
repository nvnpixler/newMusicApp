const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { Validator } = require('node-input-validator');
const modelName = 'playlists';
const subModelName = 'playlist_songs';

module.exports = {
    add_playlist: async (req, res) => {
        try {
            let v = new Validator( req.body, {
                name: 'required|string',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let checkPlaylistExists = await models[modelName].findOne({
                where : {
                    name : req.body.name,
                    user_id : req.user.id
                }
            });
            if(checkPlaylistExists){
                return helper.failed(res, 'Playlist name already exists')
            }

            req.body.user_id = req.user.id

            await models[modelName].create(req.body);

            return helper.success(res, "Playlist created successfully.", {});
        } catch (err) {
            return helper.failed(res, err);
        }
    },

    playlist_list: async (req, res) => {
        try {
            
            let get_list = await models[modelName].findAll({
                where : {
                    user_id: req.user.id
                }
            });

            return helper.success(res, "Playlist list.", get_list);
        } catch (err) {
            return helper.failed(res, err);
        }
    },

    playlist_detail: async (req, res) => {
        try {
            let v = new Validator( req.params, {
                id: 'required|integer',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let isLikeQuery = `ifnull((select is_love from loved_songs where user_id=${req.user.id} and song_id=playlist_songs.song_id ),0)`;
            let isBuyQuery = `ifnull((select count(id) from buy_songs where user_id=${req.user.id} and song_id=playlist_songs.song_id ),0)`;

            let checkPlaylistExists = await models[modelName].findOne({
                include:[
                    {
                        model:models[subModelName],
                        include:[
                            {
                                model:models['users'],
                                attributes:['id','name']
                            },
                            {
                                model:models['songs'],
                                attributes:{
                                    include:[
                                        [ sequelize.literal( isLikeQuery ), "is_loved" ],
                                        [ sequelize.literal( isBuyQuery ), "is_buy" ]
                                    ]
                                },
                            }
                        ]
                    },
                ],
                where : {
                    id: req.params.id,
                    user_id: req.user.id
                }
            });
            if(checkPlaylistExists){
                return helper.success(res, "Playlist details.", checkPlaylistExists);
            } else {
                return helper.failed(res, 'Playlist not exists!')
            }
        } catch (err) {
            return helper.failed(res, err);
        }
    },

    add_playlist_song: async (req, res) => {
        try {
            let v = new Validator( req.body, {
                playlist_id: 'required|integer',
                song_id: 'required',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            req.body.user_id = req.user.id
            let songIdArray = req.body.song_id.split(',')
            console.log(songIdArray,'--songIdArray--');
            let checkSongExistInArray = []
            let addSongArray = []
            for(let i in songIdArray){
                let checkPlaylistSongExists = await models[subModelName].findOne({
                    where : {
                        song_id : songIdArray[i],
                        playlist_id : req.body.playlist_id,
                        user_id : req.user.id
                    },
                    raw:true
                });
                console.log(songIdArray[i],'---songIdArray[i]---');
                if(checkPlaylistSongExists){
                    checkSongExistInArray.push(checkPlaylistSongExists)
                } 
                if(!checkPlaylistSongExists) {
                    req.body.song_id = songIdArray[i]
                    addSongArray.push(req.body)
                }
            }
            console.log(addSongArray,'---addSongArray---');
            // return
            if(checkSongExistInArray.length > 0){
                return helper.failed(res, "Song is already added to this playlist!");
            } else {
                for(let i in songIdArray){
                    let checkPlaylistSongExists = await models[subModelName].findOne({
                        where : {
                            song_id : songIdArray[i],
                            playlist_id : req.body.playlist_id,
                            user_id : req.user.id
                        },
                        raw:true
                    });
                    if(!checkPlaylistSongExists){
                        req.body.song_id = songIdArray[i]
                        await models[subModelName].create(req.body);
                    }
                }

                let getPlaylistData = await helper.getPlaylistById(req.body.playlist_id);
                let saveNotificationObj = {
                    sender_id:req.user.id,
                    receiver_id:req.user.id,
                    song_id:songIdArray[0],
                    message:`New song is added to the playlist '${getPlaylistData.name}'`,
                    type:1
                }
                await models['notifications'].create(saveNotificationObj)
                // await models[subModelName].bulkCreate(addSongArray);
                return helper.success(res, "Song added successfully.", {});
            }

            /* for(let i in songIdArray){
                let checkPlaylistSongExists = await models[subModelName].findOne({
                    where : {
                        song_id : songIdArray[i],
                        playlist_id : req.body.playlist_id,
                        user_id : req.user.id
                    },
                    raw:true
                });
                if(!checkPlaylistSongExists){
                    req.body.song_id = songIdArray[i]
                    await models[subModelName].create(req.body);
                    // return helper.failed(res, 'This song is already added to this playlist!')
                }
            } */
        } catch (err) {
            return helper.failed(res, err);
        }
    },

    playlist_delete: async (req, res) => {
        try {
            let v = new Validator( req.params, {
                id: 'required|integer',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let checkPlaylistExists = await models[modelName].findOne({
                where : {
                    id: req.params.id,
                    user_id: req.user.id
                }
            });
            if(checkPlaylistExists){
                await models[modelName].destroy({
                    where : {
                        id: req.params.id,
                        user_id: req.user.id
                    }
                });
                return helper.success(res, "Playlist deleted successfully.", {});
            } else {
                return helper.failed(res, 'Playlist not exists!')
            }
        } catch (err) {
            return helper.failed(res, err);
        }
    },

    playlist_song_delete: async (req, res) => {
        try {
            let v = new Validator( req.params, {
                // id: 'required|integer',
                id: 'required',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let checkPlaylistExists = await models[subModelName].findOne({
                where : {
                    id: req.params.id,
                    user_id: req.user.id
                }
            });
            if(checkPlaylistExists){
                await models[subModelName].destroy({
                    where : {
                        id: req.params.id,
                        user_id: req.user.id
                    }
                });
                return helper.success(res, "Playlist song deleted successfully.", {});
            } else {
                return helper.failed(res, 'Playlist song not exists!')
            }
        } catch (err) {
            return helper.failed(res, err);
        }
    },
    
}