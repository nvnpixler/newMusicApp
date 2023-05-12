const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { Validator } = require('node-input-validator');
const modelName = 'notifications';

module.exports = {

    notification_list: async (req, res) => {
        try {

            let isLikeQuery = `ifnull((select is_love from loved_songs where user_id=${req.user.id} and song_id=song.id ),0)`;
            let isBuyQuery = `ifnull((select count(id) from buy_songs where user_id=${req.user.id} and song_id=song.id ),0)`;

            let get_list = await models[modelName].findAll({
                include:[
                    {
                        model:models['users'],
                        as:'sender',
                        attributes:['id','name']
                    },
                    {
                        model:models['users'],
                        as:'receiver',
                        attributes:['id','name']
                    },
                    {
                        model:models['songs'],
                        attributes:{
                            include:[
                                [ sequelize.literal( isLikeQuery ), "is_loved" ],
                                [ sequelize.literal( isBuyQuery ), "is_buy" ],
                            ]
                        },
                    },
                ],
                where : {
                    receiver_id: req.user.id
                },
                order:[['id','DESC']]
            });

            await models[modelName].update({
                is_read : 1
            },
                {
                where : {
                    receiver_id: req.user.id
                }
            });

            return helper.success(res, "Notification list.", get_list);
        } catch (err) {
            return helper.failed(res, err);
        }
    },

    notification_delete: async (req, res) => {
        try {
            let whereCondition = {}
            if(req.query.id){
                let idArray = req.query.id.split(',')
                console.log(idArray,'--idArray---');
                whereCondition.id = idArray 
                whereCondition.receiver_id = req.user.id
                console.log(whereCondition,'--whereCondition---');
                console.log(req.user.id,'--req.user.id---');
                await models[modelName].destroy({
                    where : {
                        ...whereCondition
                        // receiver_id: req.user.id
                    }
                });
            }

            return helper.success(res, "Notifications cleared.", {});
            
        } catch (err) {
            return helper.failed(res, err);
        }
    },

    notification_status_update: async (req, res) => {
        try {
            let notification_status = req.user.notification_status == 1 ? 0 : 1;
            await models['users'].update({
                notification_status
            },
                {
                where : {
                    id: req.user.id
                }
            });
            return helper.success(res, "Notification status updated.", {notification_status});
            
        } catch (err) {
            return helper.failed(res, err);
        }
    },
    
}