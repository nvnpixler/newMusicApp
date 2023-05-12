const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op
const { Validator } = require('node-input-validator');
const saltRounds = 10;
const modelName = "avatars";

module.exports = {
    index: async(req, res)=>{
        try{
            let list = await models[modelName].findAll({
                order:[['id','DESC']]
            });
            res.render('admin/avatar/index',{
                data: list,
                title: 'avatar',
            });
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    create: function async(req, res) {
        try{
            res.render('admin/avatar/add',{
                title: 'avatar',
            }); 
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    store: async function (req, res) {
        try{
            let v = new Validator( req.body, {
                // description: 'required',
                title: 'required',
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
            let checkName = await models[modelName].findOne({
                where:{
                    title:req.body.title
                }
            });

            if(checkName){
                req.flash('flashMessage', { color: 'error', message: 'Avatar title already exists!' });
                res.redirect('/admin/avatar/create')
            } else {
                let image = ''
                if (req.files && req.files.image) {
                    let imageName = helper.fileUpload(req.files.image, 'users', 'uploads');
                    image = imageName
                }
                let body = {
                    title: req.body.title,
                    image: image,
                }
                await models[modelName].create(body)

                let message = 'Avatar added successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/avatar/list')
            }  
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    edit: async function(req, res) {
        try{
            let data = await models[modelName].findOne({
                where:{
                    id:req.params.id
                }
            });
            if(data){
                res.render('admin/avatar/edit',{
                    title: 'avatar',
                    data
                });
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Avatar not exists!' });
                res.redirect('/admin/avatar/list')
            } 
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    update: async function(req, res) {
        try{
            let v = new Validator( req.body, {
                // description: 'required',
                title: 'required',
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

            let data = await models[modelName].findOne({
                where:{
                    id:req.params.id
                }
            });
            if(data){
                let checkName = await models[modelName].findOne({
                    where:{
                        title:req.body.title,
                        id: {[Op.ne]: req.params.id}
                    }
                });
    
                if(checkName){
                    req.flash('flashMessage', { color: 'error', message: 'Avatar title already exists!' });
                    res.redirect(`/admin/avatar/edit/${req.params.id}`)
                } else {
                    data.title = req.body.title
                    if (req.files && req.files.image) {
                        let imageName = helper.fileUpload(req.files.image, 'users', 'uploads');
                        data.image = imageName
                    }
                    data.save();
    
                    let message = 'Avatar updated successfully!';
                    req.flash('flashMessage', { color: 'success', message }); 
                    res.redirect('/admin/avatar/list')
                }
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Avatar not exists!' });
                res.redirect('/admin/avatar/list')
            }
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    delete: async function (req, res) {
        try{
            console.log(req.params,'--req.body--');
            let v = new Validator( req.params, {
                id: 'required',
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
            let checkAvatar = await models[modelName].findOne({
                where:{
                    id:req.params.id
                }
            });

            if(!checkAvatar){
                req.flash('flashMessage', { color: 'error', message: 'Avatar not exists!.' });
                res.redirect('/admin/avatar/list')
            } else {
                await models[modelName].destroy({
                    where:{
                        id:req.params.id
                    }
                });
                let message = 'Avatar deleted successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/avatar/list')
            }
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    update_status: async function (req, res) {
        try{
            let checkCategory = await models[modelName].findOne({
                where:{
                    id:req.params.id
                }
            });
            if(checkCategory){
                checkCategory.status = checkCategory.status == '1' ? '0' : '1';
                checkCategory.save();
                let message = 'Status updated successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/avatar/list')
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Avatar already exists!' });
                res.redirect('/admin/avatar/list')
            }  
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

}