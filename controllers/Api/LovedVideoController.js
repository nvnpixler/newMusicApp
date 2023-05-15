const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { Validator } = require('node-input-validator');
const modelName = 'loved_video';

module.exports = {

    loved_video_list: async (req, res) => {
        try {
            let v = new Validator(req.query, {
                type: 'required|integer|in:0,1',
            });
            let errorsResponse = await helper.checkValidation(v);
    
            if (errorsResponse) {
                return helper.failed(res, errorsResponse);
            }
    
            let get_list = await models[modelName].findAll({
                include: [
                    {
                        model: models['users'],
                    },
                    {
                        model: models['video_details'],
                    },
                ],
                where: {
                    user_id: req.body.user_id,
                    is_love: req.query.type,
                },
            });
    
            return res.status(200).json({
                'success': true,
                'code': 200,
                'body': get_list
            });

        } catch (err) {
            console.error('Error:', err);
            return helper.failed(res, err);
        }
    },
    

    love_unLike_video: async (req, res) => {
        try {
            let v = new Validator(req.body, {
                video_id: 'required|integer',
                status: 'required|integer',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let checkPlaylistVideoExists = await models[modelName].findOne({
                where : {
                    video_id : req.body.video_id,
                    user_id : req.body.user_id
                },
                raw:true
            });
            if(checkPlaylistVideoExists){
                await models[modelName].update({
                    is_love: req.body.status
                },
                    {
                    where : {
                        id: checkPlaylistVideoExists.id
                    }
                });
            } else {
                let create =  await models[modelName].create(req.body);

                return res.status(200).json({
                    'success': true,
                    'code': 200,
                    'body': create
                });
               
            }
            return helper.success(res, "Video updated successfully.", {});
        } catch (err) {
            return helper.failed(res, err);
        }
    },

}