const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { Validator } = require('node-input-validator');
const modelName = 'video_add_lib';

module.exports = {

    video_list: async (req, res) => {
        try {
            let v = new Validator(req.body, {
                user_id: 'required|integer',
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
                    is_add: 1,
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


    Add_video: async (req, res) => {
        try {
            console.log(req.body)
            let v = new Validator(req.body, {
                video_id: 'required|integer',
                user_id: 'required|integer',
                is_add: 'required|integer'
            });
            let errorsResponse = await helper.checkValidation(v)

            if (errorsResponse) {
                return helper.failed(res, errorsResponse)
            }

            let checkPlaylistVideoExists = await models[modelName].findOne({
                where: {
                    video_id: req.body.video_id,
                    user_id: req.body.user_id
                },
                raw: true
            });

            if(checkPlaylistVideoExists) {

                if(checkPlaylistVideoExists.is_add === 1) {
                    return res.status(200).json({
                        'success': true,
                        'code': 200,
                        'message': "Already added this"
                    });
                }else{
                    await models[modelName].update({
                        is_add: req.body.is_add
                    },
                        {
                        where : {
                            id: checkPlaylistVideoExists.id
                        }
                    });

                    return res.status(200).json({
                        'success': true,
                        'code': 200,
                        'message': "Updated successfully",
                    });
                }
            }else{
                let addedVideo2 =  await models[modelName].create(req.body);
                return res.status(200).json({
                    'success': true,
                    'code': 200,
                    'message': "Added successfully",
                    'body': addedVideo2
                });
            }
         } catch (err) {
            return helper.failed(res, err);
        }
    },

    remove_Video: async (req, res) => {
        try {
            let v = new Validator(req.body, {
                video_id: 'required|integer',
                user_id: 'required|integer',
                is_add: 'required|integer',
            });
            let errorsResponse = await helper.checkValidation(v)

            if (errorsResponse) {
                return helper.failed(res, errorsResponse)
            }

            let checkPlaylistVideoExists = await models[modelName].findOne({
                where: {
                    video_id: req.body.video_id,
                    user_id: req.body.user_id
                },
                raw: true
            });

           if(checkPlaylistVideoExists) {

           let removed = await models[modelName].update({
            is_add: req.body.is_add
            },
            {
            where : {
                id: checkPlaylistVideoExists.id
            }
        });

        return res.status(200).json({
                'success': true,
                'code': 200,
                'message': "Remove successfully",
                "body": removed
            });
           }

        } catch (err) {
            return helper.failed(res, err);
        }
    },

}