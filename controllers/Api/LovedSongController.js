const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { Validator } = require('node-input-validator');
const modelName = 'loved_songs';

module.exports = {

    loved_song_list: async (req, res) => {
        try {
            let v = new Validator( req.query, {
                type: 'required|integer|in:0,1',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let isBuyQuery = `ifnull((select count(id) from buy_songs where user_id=${req.user.id} and song_id=loved_songs.song_id ),0)`;

            let get_list = await models[modelName].findAll({
                attributes:{
                    include:[
                        [ sequelize.literal( isBuyQuery ), "is_buy" ],
                    ]
                },
                include:[
                    {
                        model:models['users'],
                    },
                    {
                        model:models['songs'],
                    },
                ],
                where : {
                    user_id: req.user.id,
                    is_love: req.query.type
                }
            });

            return helper.success(res, "Loved songs list.", get_list);
        } catch (err) {
            return helper.failed(res, err);
        }
    },

    love_unlove_song: async (req, res) => {
        try {
            let v = new Validator( req.body, {
                song_id: 'required|integer',
                status: 'required|integer',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let checkPlaylistSongExists = await models[modelName].findOne({
                where : {
                    song_id : req.body.song_id,
                    user_id : req.user.id
                },
                raw:true
            });
            if(checkPlaylistSongExists){
                await models[modelName].update({
                    is_love: req.body.status
                },
                    {
                    where : {
                        id: checkPlaylistSongExists.id
                    }
                });
            } else {
                req.body.user_id = req.user.id
    
                await models[modelName].create(req.body);
            }
            let msgType = req.body.status == 1 ? 'liked' : 'unliked'
            if(req.body.status == 1){
                let getSongData = await helper.getSongById(req.body.song_id);
                let saveNotificationObj = {
                    sender_id:req.user.id,
                    receiver_id:req.user.id,
                    song_id:req.body.song_id,
                    message:`'${getSongData.name}' is added to your favorites list.`,
                    type:1
                }
                await models['notifications'].create(saveNotificationObj)
            }

            return helper.success(res, "Song updated successfully.", {});
        } catch (err) {
            return helper.failed(res, err);
        }
    },

}