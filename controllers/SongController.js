const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op
const { Validator } = require('node-input-validator');
const saltRounds = 10;
const modelName = "songs";

module.exports = {
    index: async(req, res)=>{
        try{
            let data = await models[modelName].findAll({
                include:[
                    {
                        model:models['users'],
                        attibutes:['id','name']
                    },
                    {
                        model:models['categories'],
                        attibutes:['id','name']
                    }
                ]
            });
            // console.log('----',data,'-------');
            res.render('admin/song/index',{
                data,
                title: 'song',
            });
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    create: async function(req, res) {
        try{
            let category = await models['categories'].findAll({
                where:{
                    status:'1'
                }
            })
            let singers = await models['users'].findAll({
                where:{
                    role:'1'
                }
            })
            res.render('admin/song/add',{
                title: 'song',
                category,
                singers
            }); 
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    store: async function (req, res) {
        try{
            console.log(req.body,'--req.body--');
            let v = new Validator( req.body, {
                user_id: 'required',
                category_id: 'required',
                name: 'required',
                artist: 'required',
                price: 'required',
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
            let checkName = await models[modelName].findOne({
                where:{
                    name:req.body.name,
                    category_id:req.body.category_id
                }
            });

            if(checkName){
                req.flash('flashMessage', { color: 'error', message: 'Song name already exists!.' });
                res.redirect('/singer/song/create')
            } else {
                let image = ''
                if (req.files && req.files.image) {
                    let imageName = helper.fileUpload(req.files.image, 'songs', 'uploads');
                    image = imageName
                }

                let music = ''
                if (req.files && req.files.music) {
                    let imageName = helper.fileUpload(req.files.music, 'songs', 'uploads');
                    music = imageName
                }

                let body = {
                    name: req.body.name,
                    category_id: req.body.category_id,
                    user_id: req.body.user_id,
                    image: image,
                    music: music,
                    artist: req.body.artist,
                    price: req.body.price,
                    description: req.body.description
                }
                await models[modelName].create(body)

                let message = 'Song added successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/song/list')
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

            let category = await models['categories'].findAll({
                where:{
                    status:'1'
                }
            })
            let singers = await models['users'].findAll({
                where:{
                    role:'1'
                }
            })
            res.render('admin/song/edit',{
                title: 'song',
                category,
                data,
                singers
            });
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    update: async function(req, res) {
        try{

            let v = new Validator( req.body, {
                category_id: 'required',
                name: 'required',
                artist: 'required',
                price: 'required',
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

            let data = await models[modelName].findOne({
                where:{
                    id:req.params.id
                }
            });
            if(data){
                let checkName = await models[modelName].findOne({
                    where:{
                        name:req.body.name,
                        id: {[Op.ne]: req.params.id},
                        // category_id:req.body.category_id
                    }
                });
    
                if(checkName){
                    req.flash('flashMessage', { color: 'error', message: 'Song name already exists!' });
                    res.redirect(`/admin/song/edit/${req.params.id}`)
                } else {
                    data.name = req.body.name
                    data.artist = req.body.artist
                    data.price = req.body.price
                    data.description = req.body.description
                    data.category_id = req.body.category_id
                    data.user_id = req.body.user_id
                    if (req.files && req.files.image) {
                        let imageName = helper.fileUpload(req.files.image, 'songs', 'uploads');
                        data.image = imageName
                    }
                    if (req.files && req.files.music) {
                        let musicName = helper.fileUpload(req.files.music, 'songs', 'uploads');
                        data.music = musicName
                    }
                    data.save();
    
                    let message = 'Song updated successfully!';
                    req.flash('flashMessage', { color: 'success', message }); 
                    res.redirect('/admin/song/list')
                }
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Song not exists!' });
                res.redirect('/admin/song/list')
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
            let checkSinger = await models[modelName].findOne({
                where:{
                    id:req.params.id
                }
            });

            if(!checkSinger){
                req.flash('flashMessage', { color: 'error', message: 'Song not exists!.' });
                res.redirect('/admin/song/list')
            } else {
                await models[modelName].destroy({
                    where:{
                        id:req.params.id
                    }
                });
                let message = 'Song deleted successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/song/list')
            }
            
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

}