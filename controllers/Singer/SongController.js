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

            let whereCondition = {}

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
                where:{
                    user_id: req.session.singer.id,
                    ...whereCondition
                },
                order:[['id','DESC']]
            });
            // console.log('----',data,'-------');
            res.render('singer/song/index',{
                data,
                title: 'song',
                category,
                whereCondition
            });
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    create: async function(req, res) {
        try{
            if(req.session.singer.is_otp_verified == 0){
                let message = 'You are not allowed to add songs without verification!';
                req.flash('flashMessage', { color: 'error', message }); 
                res.redirect('/singer/song/list')
            }
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
            res.render('singer/song/add',{
                title: 'song',
                category,
                genresData
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
                    user_id: req.session.singer.id,
                    image: image,
                    music: music,
                    artist: req.body.artist,
                    price: req.body.price,
                    is_hall_of_fame: req.body.is_hall_of_fame ? 1 : 0,
                    description: req.body.description ? req.body.description : '',
                    genres_id: req.body.genres_id
                }
                let createSong = await models[modelName].create(body)

                createSong = createSong.toJSON()

                let saveNotificationArray = []

                let iosDeviceToken = []

                let androidDeviceToken = []

                let getSingerSongs = await models['songs'].findAll({
                    where:{
                        user_id: req.session.singer.id
                    },
                    raw:true
                })

                let getSingerSongIds = await helper.getSongIdArray(getSingerSongs,'id')
                
                let getSingerLovedSongs = await helper.getLovedSongListBySongId(getSingerSongIds)
                
                let getSingerUserIds = await helper.getSongIdArray(getSingerLovedSongs,'user_id')

                let getUsers = await helper.getAllUsersById(getSingerUserIds)

                getUsers = getUsers.map((user)=>{
                    let saveNotificationObj = {
                        sender_id:req.session.singer.id,
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

                console.log(saveNotificationArray,'--saveNotificationArray--');

                if(saveNotificationArray.length > 0){
                    await models['notifications'].bulkCreate(saveNotificationArray)
                }
                // await helper.saveNotification(saveNotificationData)

                let push_data = {
                    message : `New song is added '${req.body.name}'. Listen now!`,
                    sender_id : req.session.singer.id,
                    sender_name : req.session.singer.name,
                    sender_image : req.session.singer.image,
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
                res.redirect('/singer/song/list')
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
            res.render('singer/song/view',{
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
            res.render('singer/song/edit',{
                title: 'song',
                category,
                data,
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
                        // category_id:req.body.category_id
                    }
                });
    
                if(checkName){
                    req.flash('flashMessage', { color: 'error', message: 'Song name already exists!' });
                    res.redirect(`/singer/song/edit/${req.params.id}`)
                } else {
                    data.name = req.body.name
                    data.artist = req.body.artist
                    data.price = req.body.price
                    data.is_hall_of_fame = req.body.is_hall_of_fame ? 1 : 0
                    data.description = req.body.description
                    // data.category_id = req.body.category_id
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
                    res.redirect('/singer/song/list')
                }
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Song not exists!' });
                res.redirect('/singer/song/list')
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
                res.redirect('/singer/song/list')
            } else {
                await models[modelName].destroy({
                    where:{
                        id:req.params.id
                    }
                });
                let message = 'Song deleted successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/singer/song/list')
            }
            
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

}