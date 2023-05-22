const models = require('../../models');
const helper = require('../../helpers/helper');
const { Validator } = require('node-input-validator');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const modelName = "video_details";


module.exports = {


    index: async (req, res) => {
        try {
            let category = await models['categories'].findAll({
                where: {
                    status: '1'
                }
            })
            let genresData = await models['genres'].findAll({
                where: {
                    status: '1'
                }
            });
            let singers = await models['users'].findAll({
                where: {
                    role: '1'
                }
            });

            let whereCondition = {}

            if (req.query.singer && req.query.singer != '') {
                whereCondition.user_id = req.query.singer
            }
            if (req.query.category && req.query.category != '') {
                whereCondition.category_id = req.query.category
            }
            let data = await models[modelName].findAll({
                include: [
                    {
                        model: models['users'],
                        attibutes: ['id', 'name']
                    },
                    {
                        model: models['categories'],
                        attibutes: ['id', 'name']
                    },
                    {
                        model: models['genres'],
                        attibutes: ['id', 'name']
                    }
                ],
                where: { ...whereCondition },
                order: [['id', 'DESC']]
            });
            // console.log('----',data,'-------');
            res.render('admin/video/index', {
                data,
                category,
                genresData,
                singers,
                title: 'video',
                whereCondition,
            });
        } catch (err) {
            console.log(err);
            return helper.error(res, err);
        }
    },

    create: async function (req, res) {
        try {
            let category = await models['categories'].findAll({
                where: {
                    status: '1'
                }
            })
            let genresData = await models['genres'].findAll({
                where: {
                    status: '1'
                }
            })
            let singers = await models['users'].findAll({
                where: {
                    role: '1'
                }
            })
            res.render('admin/video/add', {
                title: 'video',
                category,
                genresData,
                singers
            });
        } catch (err) {
            console.log(err);
            return helper.error(res, err);
        }
    },

    store: async function (req, res) {
        try {
            console.log(req.body, '--req.body--');
            let v = new Validator(req.body, {
                category_id: 'required',
                genres_id: 'required',
                user_id: 'required',
                name: 'required',
                artist: 'required',
                director: 'required',
                producer: 'required',
                price: 'required',
                description: 'required',
                duration: 'required',
                videoURL: 'required|url',
                subTitleURL: 'required|url'
            });
            var errorsResponse
            await v.check().then(function (matched) {
                if (!matched) {
                    var valdErrors = v.errors;
                    var respErrors = [];
                    Object.keys(valdErrors).forEach(function (key) {
                        if (valdErrors && valdErrors[key] && valdErrors[key].message) {
                            respErrors.push(valdErrors[key].message);
                        }
                    });
                    errorsResponse = respErrors.join(', ');
                    // return helper.error(res, errorsResponse)
                }
            });
            if (errorsResponse) {
                return helper.error(res, errorsResponse)
            }
            let checkName = await models[modelName].findOne({
                where: {
                    name: req.body.name,
                    category_id: req.body.category_id
                }
            });

            if (checkName) {
                req.flash('flashMessage', { color: 'error', message: 'Video name already exists!.' });
                res.redirect('/admin/video/create')
            } else {
                let image = ''
                if (req.files && req.files.image) {
                    let imageName = helper.fileUpload(req.files.image, 'video', 'uploads');
                    image = imageName
                }
                let body = {
                    name: req.body.name,
                    category_id: req.body.category_id,
                    genres_id: req.body.genres_id,
                    user_id: req.body.user_id,
                    name: req.body.name,
                    artist: req.body.artist,
                    director: req.body.director,
                    producer: req.body.producer,
                    price: req.body.price,
                    description: req.body.description ? req.body.description : '',
                    duration: req.body.duration,
                    image: image,
                    videoURL: req.body.videoURL,
                    subTitleURL: req.body.subTitleURL,
                    artist: req.body.artist,
                    price: req.body.price
                }

                try {
                    await models[modelName].create(body);
                    let message = 'Video added successfully!';
                    req.flash('flashMessage', { color: 'success', message });
                    res.redirect('/admin/video/list')
                }
                catch (err) {
                    req.flash('flashMessage', { color: 'error', message: err.message });
                }

            }

        } catch (err) {
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
            });
            res.render('admin/video/view',{
                title: 'video',
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
            res.render('admin/video/edit',{
                title: 'video',
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
        console.log(req.body)
        try{
                let v = new Validator( req.body, {
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
                        id: {[Op.ne]: req.params.id}
                    }
                });
    
                if(checkName){
                    req.flash('flashMessage', { color: 'error', message: 'Video name already exists!' });
                    res.redirect(`/admin/video/edit/${req.params.id}`)
                } else {
                    data.name = req.body.name,
                    data.user_id = req.body.user_id,
                    data.name = req.body.name,
                    data.artist = req.body.artist,
                    data.director = req.body.director,
                    data.producer = req.body.producer,
                    data.price = req.body.price,
                    data.description = req.body.description ? req.body.description : '',
                    data.duration = req.body.duration,
                    data.videoURL = req.body.videoURL,
                    data.subTitleURL = req.body.subTitleURL,
                    data.artist = req.body.artist,
                    data.price = req.body.price

                    if (req.files && req.files.image) {
                        let imageName = helper.fileUpload(req.files.image, 'video', 'uploads');
                        data.image = imageName
                    }

                    data.save();
    
                    let message = 'Video updated successfully!';
                    req.flash('flashMessage', { color: 'success', message }); 
                    res.redirect('/admin/video/list')
                }
            } else {
                req.flash('flashMessage', { color: 'error', message: 'video not exists!' });
                res.redirect('/admin/video/list')
            }
        } catch(err){
            console.log(err.message);
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
                req.flash('flashMessage', { color: 'error', message: 'Video not exists!.' });
                res.redirect('/admin/video/list')
            } else {
                await models[modelName].destroy({
                    where:{
                        id:req.params.id
                    }
                });
                let message = 'Video deleted successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/video/list')
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
}



