const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { Validator } = require('node-input-validator');
const modelName = 'buy_songs';

module.exports = {
    buy_song: async (req, res) => {
        try {
            let v = new Validator( req.body, {
                song_id: 'required|integer',
                transaction_id: 'required',
                price: 'required',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let checkSong = await models['songs'].findOne({
                where : {
                    id : req.body.song_id
                },
                raw:true
            });
            if(!checkSong){
                return helper.failed(res, 'This song is not exists!')
            }

            let checkSongBuy = await models[modelName].findOne({
                where : {
                    song_id : req.body.song_id,
                    user_id : req.user.id
                }
            });
            if(checkSongBuy){
                return helper.failed(res, 'This song is already purchased!')
            }

            req.body.user_id = req.user.id
            req.body.singer_id = checkSong.user_id
            req.body.amount = req.body.price

            await models[modelName].create(req.body);
            await models['transactions'].create(req.body);

            return helper.success(res, "Song purchased successfully.", {});
        } catch (err) {
            return helper.failed(res, err);
        }
    },

    song_buy_list: async (req, res) => {
        try {

            let isLikeQuery = `ifnull((select is_love from loved_songs where user_id=${req.user.id} and song_id=buy_songs.song_id ),0)`;
            
            let get_list = await models[modelName].findAll({
                include:[
                    {
                        model:models['users'],
                        attributes:['id','name']
                    },
                    {
                        model:models['songs'],
                        attributes:{
                            include:[
                                [ sequelize.literal( isLikeQuery ), "is_loved" ]
                            ]
                        },
                    }
                ],
                where : {
                    user_id: req.user.id
                }
            });

            return helper.success(res, "Purchased list.", get_list);
        } catch (err) {
            return helper.failed(res, err);
        }
    },
    
}