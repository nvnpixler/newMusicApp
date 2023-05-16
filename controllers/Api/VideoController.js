const models = require('../../models');
const helper = require('../../helpers/helper');
const { Validator } = require('node-input-validator');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const modelName = "video_details";


module.exports = {
    async getVideo(req, res) {
        try {
            let whereCondition = {}

            if (req.query.singer && req.query.singer != '') {
                whereCondition.user_id = req.query.singer
            }
            if (req.query.category && req.query.category != '') {
                whereCondition.category_id = req.query.category
            }
            let list = await models[modelName].findAll({
                include: [
                    {
                        model: models['users'],
                        attibutes: ['id', 'name']
                    },
                    {
                        model: models['categories'],
                        attibutes: ['id', 'name']
                    },
                    {
                        model: models['genres'],
                        attibutes: ['id', 'name']
                    }
                ],
                where: { ...whereCondition },
                order: [['id', 'DESC']]
            });
            res.json(list);
        } catch (err) {
            return helper.error(res, err);
        }
    },

    view: async function (req, res) {
        try {
            let data = await models[modelName].findOne({
                include: [
                    {
                        model: models['users'],
                        attibutes: ['id', 'name']
                    },
                    {
                        model: models['categories'],
                        attibutes: ['id', 'name']
                    },
                    {
                        model: models['genres'],
                        attibutes: ['id', 'name']
                    }
                ],
                where: {
                    id: req.params.id
                }
            });

            res.send(data)
        } catch (err) {
            console.log(err);
            return helper.error(res, err);
        }
    }
};