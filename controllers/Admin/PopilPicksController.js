const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op
const { Validator } = require('node-input-validator');
const saltRounds = 10;
const modelName = "popil_picks";
const subModelName = "popil_pick_songs";

module.exports = {
    index: async(req, res)=>{
        try{
            let list = await models[modelName].findAll({
                order:[['id','DESC']]
            });
            res.render('admin/popil_pick/index',{
                data: list,
                title: 'popil_pick',
            });
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    create: function async(req, res) {
        try{
            res.render('admin/popil_pick/add',{
                title: 'popil_pick',
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
                req.flash('flashMessage', { color: 'error', message: 'Popil picks already exists!' });
                res.redirect('/admin/popil_pick/create')
            } else {
                let image = ''
                if (req.files && req.files.image) {
                    let imageName = helper.fileUpload(req.files.image, 'popil_pick', 'uploads');
                    image = imageName
                }
                let body = {
                    name: req.body.name,
                    description: req.body.description ? req.body.description : '',
                    image: image,
                }
                await models[modelName].create(body)

                let message = 'Popil picks added successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/popil_pick/list')
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
                res.render('admin/popil_pick/edit',{
                    title: 'popil_pick',
                    data
                });
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Popil picks not exists!' });
                res.redirect('/admin/popil_pick/list')
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
                    req.flash('flashMessage', { color: 'error', message: 'Popil picks already exists!' });
                    res.redirect(`/admin/popil_pick/edit/${req.params.id}`)
                } else {
                    data.name = req.body.name
                    data.description = req.body.description ? req.body.description : ''
                    if (req.files && req.files.image) {
                        let imageName = helper.fileUpload(req.files.image, 'popil_pick', 'uploads');
                        data.image = imageName
                    }
                    data.save();
    
                    let message = 'Popil picks updated successfully!';
                    req.flash('flashMessage', { color: 'success', message }); 
                    res.redirect('/admin/popil_pick/list')
                }
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Popil picks not exists!' });
                res.redirect('/admin/popil_pick/list')
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
            let checkPopilPick = await models[modelName].findOne({
                where:{
                    id:req.params.id
                }
            });

            if(!checkPopilPick){
                req.flash('flashMessage', { color: 'error', message: 'Popil pick not exists!.' });
                res.redirect('/admin/popil_pick/list')
            } else {
                await models[modelName].destroy({
                    where:{
                        id:req.params.id
                    }
                });
                let message = 'Popil pick deleted successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/popil_pick/list')
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
                res.redirect('/admin/popil_pick/list')
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Popil picks already exists!' });
                res.redirect('/admin/popil_pick/list')
            }  
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    popil_pick_song_list: async(req, res)=>{
        try{
            let list = await models['songs'].findAll({
                attributes:{
                    include:[
                        [ sequelize.literal( `IFNULL((select count(id) from popil_pick_songs where song_id=songs.id ),0)` ), "is_popil_song_added" ],
                    ]
                }, 
                include:[
                    {
                        model:models['users'],
                        attibutes:['id','name']
                    },
                    {
                        model:models['categories'],
                        attibutes:['id','name']
                    },
                    {
                        model:models['genres'],
                        attibutes:['id','name']
                    },
                    {
                        model:models['popil_pick_songs'],
                        // attributes:['id','name'],
                        // where : {
                        //     popil_pick_id: req.params.id
                        // },
                    }
                ],
                order:[['id','DESC']]
            });
            console.log(list,'---list----');
            res.render('admin/popil_pick/popil_pick_song',{
                data: list,
                popil_pick_id:req.params.id,
                title: 'popil_pick',
            });
        } catch(err) {
            console.log(err);
            return helper.error(res, err);
        }
    },

    add_song_to_popil_pick: async function (req, res) {
        try{
            let checkExists = await models[subModelName].findOne({
                where:{
                    popil_pick_id:req.params.popil_pick_id,
                    song_id:req.params.song_id
                },
                raw:true
            });
            if(!checkExists){
                await models[subModelName].create(req.params);
                let message = 'Added successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect(`/admin/popil_pick/song_list/${req.params.popil_pick_id}`)
            } else {
                await models[subModelName].destroy({
                    where:{
                        id:checkExists.id
                    }
                });
                let message = 'Removed successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect(`/admin/popil_pick/song_list/${req.params.popil_pick_id}`)
                // req.flash('flashMessage', { color: 'error', message: 'Popil picks already exists!' });
                // res.redirect('/admin/popil_pick/list')
            }  
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

}