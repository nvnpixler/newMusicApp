const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const jwt = require('jsonwebtoken');
const secretKey = jwtSecretKey;
const saltRounds = 10;
const { Validator } = require('node-input-validator');

const modelName = "video_details";

module.exports = {
    like_video: async (req, res) => {
        try {
           
            res.json(req.user)
            // list.dataValues.likes = req.user
            // res.render('admin/category/index',{
            //     data: list,
            //     title: 'category',
            // });
        } catch (err) {
            return helper.error(res, err);
        }
    }
}