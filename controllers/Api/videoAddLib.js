const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { Validator } = require('node-input-validator');
const modelName = 'video_add_lib';

module.exports = {

  video_list: async (req, res) => {
    try {
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

  get_video_details: async (req, res) => {
    try {
      let v = new Validator(req.body, {
        video_id: 'required|integer',
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
          user_id: req.user.id,
          video_id: req.body.video_id,
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
      let v = new Validator(req.body, {
        video_id: 'required|integer',
        is_add: 'required|integer|in:0,1', // Validate status as 0 or 1
      });
      let errorsResponse = await helper.checkValidation(v);

      if (errorsResponse) {
        return helper.failed(res, errorsResponse);
      }

      const { video_id, is_add } = req.body;
      const user_id = req.user.id;

      let checkPlaylistVideoExists = await models[modelName].findOne({
        where: {
          video_id: video_id,
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
          return helper.success(res, "Video added successfully.", {});
        } else {
          return helper.success(res, "Video remove successfully.", {});
        }
      } else {
        await models[modelName].create({
          video_id: video_id,
          user_id: user_id,
          is_add: is_add,
        });

        return helper.success(res, "Video added.", {});
      }
    } catch (err) {
      return helper.failed(res, err);
    }
  }

}