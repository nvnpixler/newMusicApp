const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { Validator } = require('node-input-validator');
const modelName = 'add_podcast';

module.exports = {

    podcast_list: async (req, res) => {
        try {
            let get_list = await models[modelName].findAll({
                include: [
                    {
                        model: models['users'],
                    },
                    {
                        model: models['songs'],
                    },
                ],
                where: {
                    user_id: req.user.id,
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

    get_podcast_details: async (req, res) => {
        try {
            let v = new Validator(req.body, {
                podcast_id: 'required|integer',
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
                        model: models['songs'],
                    },
                ],
                where: {
                    user_id: req.user.id,
                    podcast_id: req.body.podcast_id,
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

    Add_podcast: async (req, res) => {
        try {
            let v = new Validator(req.body, {
                podcast_id: 'required|integer',
                is_add: 'required|integer|in:0,1', // Validate status as 0 or 1
            });
            let errorsResponse = await helper.checkValidation(v);

            if (errorsResponse) {
                return helper.failed(res, errorsResponse);
            }

            const { podcast_id, is_add } = req.body;
            const user_id = req.user.id;

            let checkPlaylistVideoExists = await models[modelName].findOne({
                where: {
                    podcast_id: podcast_id,
                    user_id: user_id,
                },
                raw: true,
            });

            if (checkPlaylistVideoExists) {
                await models[modelName].update(
                    {
                        is_add: is_add,
                    },
                    {
                        where: {
                            id: checkPlaylistVideoExists.id,
                        },
                    }
                );

                if (is_add === 1) {
                    return helper.success(res, "added successfully.", {});
                } else {
                    return helper.success(res, "remove successfully.", {});
                }
            } else {
                await models[modelName].create({
                    podcast_id: podcast_id,
                    user_id: user_id,
                    is_add: is_add,
                });

                return helper.success(res, "added.", {});
            }
        } catch (err) {
            return helper.failed(res, err);
        }
    }

}