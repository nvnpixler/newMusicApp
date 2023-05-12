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

            let whereCondition = {}

            if(req.query.singer && req.query.singer!=''){
                whereCondition.user_id = req.query.singer
            }
            if(req.query.category && req.query.category!=''){
                whereCondition.category_id = req.query.category
            }
            let data = await models[modelName].findAll({
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
                    is_podcast:'0',
                    ...whereCondition},
                order:[['id','DESC']]
            });
            // console.log('----',data,'-------');
            res.render('admin/song/index',{
                data,
                category,
                genresData,
                singers,
                title: 'song',
                whereCondition
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
            res.render('admin/song/add',{
                title: 'song',
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
                user_id: 'required',
                category_id: 'required',
                genres_id: 'required',
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
                    category_id:req.body.category_id,
                    is_podcast:'0'
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
                    genres_id: req.body.genres_id,
                    user_id: req.body.user_id,
                    image: image,
                    music: music,
                    artist: req.body.artist,
                    price: req.body.price,
                    is_hall_of_fame: req.body.is_hall_of_fame ? 1 : 0,
                    description: req.body.description ? req.body.description : ''
                }
                let createSong = await models[modelName].create(body)

                createSong = createSong.toJSON()

                let saveNotificationArray = []

                let iosDeviceToken = []

                let androidDeviceToken = []

                let getSingerSongs = await models['songs'].findAll({
                    where:{
                        user_id: req.body.user_id
                    },
                    raw:true
                })

                let getSingerSongIds = await helper.getSongIdArray(getSingerSongs,'id')
                
                let getSingerLovedSongs = await helper.getLovedSongListBySongId(getSingerSongIds)
                
                let getSingerUserIds = await helper.getSongIdArray(getSingerLovedSongs,'user_id')

                let getUsers = await helper.getAllUsersById(getSingerUserIds)

                getUsers = getUsers.map((user)=>{
                    let saveNotificationObj = {
                        sender_id:req.session.admin.id,
                        receiver_id:user.id,
                        song_id:createSong.id,
                        message:`New song is added '${req.body.name}'. Listen now!`,
                        type:1
                    }
                    saveNotificationArray.push(saveNotificationObj)

                    if(user && user.device_type==1){
                        androidDeviceToken.push(user.device_token);
                    }
                    if(user && user.device_type==2){
                        iosDeviceToken.push(user.device_token);
                    }
                })

                if(saveNotificationArray.length > 0){
                    await models['notifications'].bulkCreate(saveNotificationArray)
                }
                // await helper.saveNotification(saveNotificationData)

                let push_data = {
                    message : `New song is added '${req.body.name}'. Listen now!`,
                    sender_id : req.session.admin.id,
                    sender_name : req.session.admin.name,
                    sender_image : req.session.admin.image,
                    song_id : createSong.id,
                    type : 1,
                }

                if(androidDeviceToken.length > 0){
                    await helper.send_push_to_multiple_device( androidDeviceToken, 1,push_data)
                }
                if(iosDeviceToken.length > 0){
                    await helper.send_push_to_multiple_device( iosDeviceToken, 2,push_data)
                }

                let message = 'Song added successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/song/list')
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
            res.render('admin/song/view',{
                title: 'song',
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
            res.render('admin/song/edit',{
                title: 'song',
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

    update: async function(req, res) {
        try{

            let v = new Validator( req.body, {
                // category_id: 'required',
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
                        is_podcast:'0'
                    }
                });
    
                if(checkName){
                    req.flash('flashMessage', { color: 'error', message: 'Song name already exists!' });
                    res.redirect(`/admin/song/edit/${req.params.id}`)
                } else {
                    data.name = req.body.name
                    data.artist = req.body.artist
                    data.price = req.body.price
                    data.is_hall_of_fame = req.body.is_hall_of_fame ? 1 : 0
                    data.description = req.body.description
                    // data.category_id = req.body.category_id
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

    getCategory: async function(req, res) {
        try{
            let data = await models[modelName].findAll({
                where:{
                    category_id:req.params.id
                }
            });

            return helper.success(res, 'Genres List', data);
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    podcast_list: async(req, res)=>{
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
                    },
                    {
                        model:models['genres'],
                        attibutes:['id','name']
                    }
                ],
                order:[['id','DESC']]
            });
            // console.log('----',data,'-------');
            res.render('admin/song/podcast_list',{
                data,
                title: 'podcast',
            });
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    update_podcast: async function (req, res) {
        try{
            let checkCategory = await models[modelName].findOne({
                where:{
                    id:req.params.id
                }
            });
            if(checkCategory){
                checkCategory.is_podcast = checkCategory.is_podcast == '1' ? '0' : '1';
                checkCategory.save();
                let message = 'Status updated successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/song/podcast_list')
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Song not exists!' });
                res.redirect('/admin/song/podcast_list')
            }  
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

}