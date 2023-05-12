const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const { Validator } = require('node-input-validator');
const saltRounds = 10;
const modelName = "users";

module.exports = {
    index: async(req, res)=>{
        try{
            let list = await models[modelName].findAll({
                where:{
                    role:"2"
                },
                order:[['id','DESC']]
            });
            res.render('admin/user/index',{
                users: list,
                title: 'user',
            });
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    create: function async(req, res) {
        try{
            res.render('admin/singer/add',{
                title: 'singer',
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
                email: 'required',
                name: 'required',
                phone: 'required',
                password: 'required',
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
            let checkEmail = await models[modelName].findOne({
                where:{
                    email:req.body.email
                }
            });

            if(checkEmail){
                req.flash('flashMessage', { color: 'error', message: 'Email already exists!.' });
                res.redirect('/admin/singer/create')
            } else {
                let image = ''
                if (req.files && req.files.image) {
                    let imageName = helper.fileUpload(req.files.image, 'users', 'uploads');
                    image = imageName
                }
                let body = {
                    name: req.body.name,
                    email: req.body.email,
                    password: await helper.bcryptHash(req.body.password, saltRounds),
                    image: image,
                    phone: req.body.phone,
                    role:'1'
                }
                await models[modelName].create(body)
                let message = 'Singer added successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/singer/list')
            }
            
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    view: async function(req, res) {
        try{
            let data = await models[modelName].findOne({
                include:[
                    {
                        model:models['transactions'],
                        attibutes:['id','name'],
                        as : 'user',
                        include:[
                            // {
                            //     model:models['users'],
                            //     attibutes:['id','name'],
                            //     as : 'user'
                            // },
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
                    },
                ],
                where:{
                    id:req.params.id
                }
            });

            console.log(data);

            res.render('admin/user/view',{
                title: 'user',
                data,
            });
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    update_status: async function(req, res) {
        try{

            let data = await models[modelName].findOne({
                where:{
                    id:req.params.id
                },
                raw:true
            })
            if(data){
                let status = data.status == '1' ? '0' : '1';
                console.log(status,'------status------------');
                await models[modelName].update({
                    status:status,
                    login_time: '0',
                    device_token:""
                },{
                    where:{
                        id:req.params.id
                    },
                })
                let message = 'Status updated successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/user/list')
            } else {
                let message = 'User not found!';
                req.flash('flashMessage', { color: 'error', message }); 
                res.redirect('/admin/user/list')
            }
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

}