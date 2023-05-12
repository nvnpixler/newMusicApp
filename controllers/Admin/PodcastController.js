const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op
const { Validator } = require('node-input-validator');
const saltRounds = 10;
// const modelName = "podcasts";
const modelName = "songs";

module.exports = {
    index: async(req, res)=>{
        try{
            let whereCondition = {}
            let list = await models[modelName].findAll({
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
                    }
                ],
                where: {
                    is_podcast:'1',
                    ...whereCondition},
                order:[['id','DESC']]
            });
            res.render('admin/podcast/index',{
                data: list,
                title: 'podcast',
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
            let genresData = await models['genres'].findAll({
                where:{
                    status:'1'
                }
            })
            let singers = await models['users'].findAll({
                where:{
                    role:'1'
                }
            })
            res.render('admin/podcast/add',{
                title: 'podcast',
                category,
                genresData,
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
                // user_id: 'required',
                category_id: 'required',
                // genres_id: 'required',
                name: 'required',
                // artist: 'required',
                // price: 'required',
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
                    category_id:req.body.category_id,
                    is_podcast:'1'
                }
            });

            if(checkName){
                req.flash('flashMessage', { color: 'error', message: 'Podcast name already exists!.' });
                res.redirect('/admin/podcast/create')
            } else {
                let image = ''
                let thumbnail = ''
                let image_type = ''
                if (req.files && req.files.image) {
                    let imageName = await helper.fileUploadMultiparty(req.files.image, 'songs', 'image');
                    image = imageName.image;
                    thumbnail = imageName.thumbnail;
                    image_type = imageName.file_type;
                }

                let music = ''
                if (req.files && req.files.music) {
                    let imageName = helper.fileUpload(req.files.music, 'songs', 'uploads');
                    music = imageName
                }

                let genresData = await models['genres'].findOne({
                    where:{
                        status:'1'
                    },
                    raw:true
                })

                let body = {
                    name: req.body.name,
                    category_id: req.body.category_id,
                    genres_id: genresData.id,
                    user_id: req.session.admin.id,
                    image: image,
                    music: music,
                    image_type : image_type,
                    artist: req.body.artist ? req.body.artist : '',
                    price: '0',
                    is_hall_of_fame: req.body.is_hall_of_fame ? 1 : 0,
                    is_podcast:'1',
                    description: req.body.description ? req.body.description : ''
                }
                let createSong = await models[modelName].create(body)

                createSong = createSong.toJSON()

                let message = 'Podcast added successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/podcast/list')
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
            let genresData = await models['genres'].findAll({
                where:{
                    status:'1'
                }
            })
            let singers = await models['users'].findAll({
                where:{
                    role:'1'
                }
            })

            if(data){
                res.render('admin/podcast/edit',{
                    title: 'podcast',
                    category,
                    data,
                    singers,
                    genresData
                });
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Podcast not exists!' });
                res.redirect('/admin/podcast/list')
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
                        is_podcast:'1'
                    }
                });
    
                if(checkName){
                    req.flash('flashMessage', { color: 'error', message: 'Podcast title already exists!' });
                    res.redirect(`/admin/podcast/edit/${req.params.id}`)
                } else {
                    data.name = req.body.name
                    // data.artist = req.body.artist
                    data.price = '0'
                    data.is_hall_of_fame = req.body.is_hall_of_fame ? 1 : 0
                    data.description = req.body.description
                    // data.category_id = req.body.category_id
                    // data.user_id = req.body.user_id
                    if (req.files && req.files.image) {
                        let imageName = await helper.fileUploadMultiparty(req.files.image, 'songs', 'image');
                        console.log(imageName,'---imageName----');
                        data.image = imageName.image;
                        data.thumbnail = imageName.thumbnail;
                        data.image_type = imageName.file_type;
                        // let imageName = helper.fileUpload(req.files.image, 'songs', 'uploads');
                        // data.image = imageName
                    }
                    if (req.files && req.files.music) {
                        let musicName = helper.fileUpload(req.files.music, 'songs', 'uploads');
                        data.music = musicName
                    }
                    data.save();
    
                    let message = 'Podcast updated successfully!';
                    req.flash('flashMessage', { color: 'success', message }); 
                    res.redirect('/admin/podcast/list')
                }
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Podcast not exists!' });
                res.redirect('/admin/podcast/list')
            }
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    view: async function(req, res) {
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
            let genresData = await models['genres'].findAll({
                where:{
                    status:'1'
                }
            })
            let singers = await models['users'].findAll({
                where:{
                    role:'1'
                }
            })
            res.render('admin/podcast/view',{
                title: 'podcast',
                category,
                data,
                singers,
                genresData
            });
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
            let checkPodcast = await models[modelName].findOne({
                where:{
                    id:req.params.id
                }
            });

            if(!checkPodcast){
                req.flash('flashMessage', { color: 'error', message: 'Podcast not exists!.' });
                res.redirect('/admin/podcast/list')
            } else {
                await models[modelName].destroy({
                    where:{
                        id:req.params.id
                    }
                });
                let message = 'Podcast deleted successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/podcast/list')
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
                res.redirect('/admin/podcast/list')
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Podcast already exists!' });
                res.redirect('/admin/podcast/list')
            }  
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

}