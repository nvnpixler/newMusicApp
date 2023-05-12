const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op
const { Validator } = require('node-input-validator');
const saltRounds = 10;
const modelName = "genres";

module.exports = {
    index: async(req, res)=>{
        try{
            let list = await models[modelName].findAll({
                include:[
                    {
                        model:models['categories'],
                        attibutes:['id','name']
                    }
                ],
            });
            res.render('admin/genres/index',{
                data: list,
                title: 'genres',
            });
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    create: async(req, res) => {
        try{
            let category = await models['categories'].findAll({
                where:{
                    status:'1'
                }
            })
            res.render('admin/genres/add',{
                title: 'genres',
                category
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
                // category_id: 'required',
                name: 'required',
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
                    name:req.body.name
                }
            });

            if(checkName){
                req.flash('flashMessage', { color: 'error', message: 'Genres already exists!' });
                res.redirect('/admin/genres/create')
            } else {
                let image = ''
                if (req.files && req.files.image) {
                    let imageName = helper.fileUpload(req.files.image, 'genres', 'uploads');
                    image = imageName
                }
                let category = await models['categories'].findOne({
                    where:{
                        status:'1'
                    },
                    raw:true
                })
                let body = {
                    name: req.body.name,
                    description: req.body.description ? req.body.description : '',
                    category_id: req.body.category_id ? req.body.category_id :category.id,
                    image: image,
                }
                await models[modelName].create(body)

                let message = 'Genres added successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/genres/list')
            }  
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    edit: async function(req, res) {
        try{
            let category = await models['categories'].findAll({
                where:{
                    status:'1'
                }
            })
            let data = await models[modelName].findOne({
                where:{
                    id:req.params.id
                }
            });
            if(data){
                res.render('admin/genres/edit',{
                    title: 'genres',
                    data,
                    category
                });
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Genres not exists!' });
                res.redirect('/admin/genres/list')
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
                name: 'required',
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
                        name:req.body.name,
                        id: {[Op.ne]: req.params.id}
                    }
                });
    
                if(checkName){
                    req.flash('flashMessage', { color: 'error', message: 'Genres already exists!' });
                    res.redirect(`/admin/genres/edit/${req.params.id}`)
                } else {
                    let category = await models['categories'].findOne({
                        where:{
                            status:'1'
                        },
                        raw:true
                    })
                    data.name = req.body.name
                    // data.category_id = req.body.category_id ? req.body.category_id :category.id
                    // data.description = req.body.description
                    if (req.files && req.files.image) {
                        let imageName = helper.fileUpload(req.files.image, 'genres', 'uploads');
                        data.image = imageName
                    }
                    data.save();
    
                    let message = 'Genres updated successfully!';
                    req.flash('flashMessage', { color: 'success', message }); 
                    res.redirect('/admin/genres/list')
                }
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Genres not exists!' });
                res.redirect('/admin/genres/list')
            }
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    update_status: async function (req, res) {
        try{
            let checkGenres = await models[modelName].findOne({
                where:{
                    id:req.params.id
                }
            });
            if(checkGenres){
                checkGenres.status = checkGenres.status == '1' ? '0' : '1';
                checkGenres.save();
                let message = 'Status updated successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/genres/list')
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Genres already exists!' });
                res.redirect('/admin/genres/list')
            }  
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

}