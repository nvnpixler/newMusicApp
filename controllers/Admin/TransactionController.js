const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const { Validator } = require('node-input-validator');
const saltRounds = 10;
const modelName = "transactions";

module.exports = {
    index: async(req, res)=>{
        try{
            let list = await models[modelName].findAll({
                include:[
                    {
                        model:models['users'],
                        attibutes:['id','name'],
                        as : 'user'
                    },
                    {
                        model:models['users'],
                        attibutes:['id','name'],
                        as : 'singer'
                    },
                    {
                        model:models['songs'],
                        attibutes:['id','name'],
                    }
                ],
                order:[['id','DESC']]
            });
            res.render('admin/transaction/index',{
                data: list,
                title: 'transaction',
            });
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

}