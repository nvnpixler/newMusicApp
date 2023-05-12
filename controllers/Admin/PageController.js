const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const { Validator } = require('node-input-validator');
const modelName = "pages";

module.exports = {
    index: async(req, res)=>{
        try{
            let list = await models[modelName].findAll();
            res.render('admin/cms/index',{
                cms: list,
                title: 'cms',
            });
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    edit: async function (req, res) {
        try{
            let getCms = await models[modelName].findOne({
                where:{
                    id:req.params.id
                }
            })
            console.log(getCms,"getCms")
            res.render('admin/cms/edit',{
                title: 'cms',
                cms: getCms
            });
            
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    update: async function (req, res) {
        try{
            let v = new Validator( req.body, {
                description: 'required',
            });
            var errorsResponse
            await v.check().then(function (matched) {
                if (!matched) {
                    var valdErrors=v.errors;
                    var respErrors=[];
                    Object.keys(valdErrors).forEach(function(key) {
                        if(valdErrors && valdErrors[key] && valdErrors[key].message){
                            respErrors.push(valdErrors[key].message);
                        }
                    });   
                    errorsResponse=respErrors.join(', ');
                    // return helper.error(res, errorsResponse)
                }
            });
            if(errorsResponse){
                return helper.error(res, errorsResponse)
            }
            let checkCms = await models[modelName].findOne({
                where:{
                    id:req.body.id
                }
            })
            if(checkCms){
                checkCms.description = req.body.description;
                checkCms.save();
                req.flash('flashMessage', { color: 'success', message: 'Cms updated Successfully.' }); 
                res.redirect('/admin/cms/list')
            } 
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },
}