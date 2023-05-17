const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { Validator } = require('node-input-validator');
const modelName = 'loved_video';

module.exports = {

    loved_video_list: async (req, res) => {
        try {
            // console.log(req.user.id)
            let v = new Validator(req.query, {
                type: 'required|integer|in:0,1',
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
                    video_id:req.query.video_id,
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
            status: 'required|integer|in:0,1', // Validate status as 0 or 1
          });
          let errorsResponse = await helper.checkValidation(v);
      
          if (errorsResponse) {
            return helper.failed(res, errorsResponse);
          }
      
          const { video_id, status } = req.body;
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
                is_love: status,
              },
              {
                where: {
                  id: checkPlaylistVideoExists.id,
                },
              }
            );
      
            if (status === 1) {
              return helper.success(res, "Video liked successfully.", {});
            } else {
              return helper.success(res, "Video disliked successfully.", {});
            }
          } else {
            await models[modelName].create({
              video_id: video_id,
              user_id: user_id,
              is_love: status,
            });
            
            return helper.success(res, "Video added to liked videos.", {});
            // if (status === 1) {
            //   return helper.success(res, "Video added to liked videos.", {});
            // } else {
            //   return helper.success(res, "Video added to disliked videos.", {});
            // }
          }
        } catch (err) {
          return helper.failed(res, err);
        }
    },

    user_like_video_list: async (req, res) => {
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
                  is_love: 1,
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
      
    
    // love_unLike_video: async (req, res) => {
    //     try {
    //       let v = new Validator(req.body, {
    //         video_id: 'required|integer',
    //         status: 'required|integer|in:0,1', // Validate status as 0 or 1
    //       });
    //       let errorsResponse = await helper.checkValidation(v);
      
    //       if (errorsResponse) {
    //         return helper.failed(res, errorsResponse);
    //       }
      
    //       const { video_id, status } = req.body;
    //       const user_id = req.user.id;
      
    //       let checkPlaylistVideoExists = await models[modelName].findOne({
    //         where: {
    //           video_id: video_id,
    //           user_id: user_id,
    //         },
    //         raw: true,
    //       });
      
    //       if (checkPlaylistVideoExists) {
    //         await models[modelName].update(
    //           {
    //             is_love: status,
    //           },
    //           {
    //             where: {
    //               id: checkPlaylistVideoExists.id,
    //             },
    //           }
    //         );
    //       } else {
    //         await models[modelName].create({
    //           video_id: video_id,
    //           user_id: user_id,
    //           is_love: status,
    //         });
    //       }
      
    //       return helper.success(res, "Video updated successfully.", {});
    //     } catch (err) {
    //       return helper.failed(res, err);
    //     }
    //   },
      

    loved_video_count: async (req, res) => {
        try {
          let v = new Validator(req.query, {
            video_id: 'required|integer',
          });
      
          let errorsResponse = await helper.checkValidation(v);
      
          if (errorsResponse) {
            return helper.failed(res, errorsResponse);
          }
      
          const count = await models[modelName].count({
            where: {
              video_id: req.query.video_id,
              is_love: 1,
            },
          });
      
          return res.status(200).json({
            success: true,
            code: 200,
            body: count,
          });
        } catch (err) {
          console.error('Error:', err);
          return helper.failed(res, err);
        }
      },
      

}