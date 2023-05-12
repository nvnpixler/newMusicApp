const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const modelName = "contact_us";

module.exports = {
    index: async(req, res)=>{
        try{
            let list = await models[modelName].findAll();
            res.render('admin/contact_us/index',{
                data: list,
                title: 'contact_us',
            });
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

}