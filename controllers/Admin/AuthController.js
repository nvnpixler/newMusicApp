const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const secretKey = jwtSecretKey;
const saltRounds = 10;
const { Validator } = require('node-input-validator');
const { where } = require('sequelize');


module.exports = {
    loginPage: function async(req, res) {
        try{
            if(!req.session.authenticated){
                res.render('admin/login',{
                    message:''
                });
            } else{
                res.redirect('/admin/dashboard');
            }
        } catch (err) {
            console.log(err,'-------errorr-----------');
            return helper.error(res, err);
        }
    },

    loginSubmit: async (req, res) => {
        try {
            let v = new Validator( req.body, {
                email: 'required', 
                password: 'required', 
                // confirm_password: 'required|same:password'
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

            let getUser = await models['users'].findOne({
                where: {
                    email: req.body.email,
                    role:'0'
                },
                raw: true,
                nest: true
            });

            if (!getUser) {
                req.flash('flashMessage', { color: 'error', message: 'Incorrect Email or Password.' });
                res.redirect('/admin/login');
                return
                // return helper.error(res, "Incorrect Email or Password.");
            }
            checkPassword = await helper.comparePass(req.body.password, getUser.password);

            if (!checkPassword) {
                req.flash('flashMessage', { color: 'error', message: 'Email or Password did not match, Please try again.' });
                res.redirect('/admin/login');
                return
                // return helper.error(res, "Email or Password did not match, Please try again.");
            }
            delete getUser.password;

            let userData = {
                id: getUser.id,
                email: getUser.email,
                password: getUser.password,
            }
            
            var token = jwt.sign({
                data: userData
            }, secretKey);
            
            getUser.token = token;
            delete getUser.password;

            console.log(getUser, '==========>getUser');

            req.session.admin = getUser;
            req.session.authenticated = true;

            req.flash('flashMessage', { color: 'success', message: 'Logged in Successfully.' });
            res.redirect('/admin/dashboard');
        } catch (err) {
            return helper.error(res, err);
        }
    },

    dashboard: async (req, res) => {
        try {
            let countObj = {}
            countObj.userCount = await models['users'].count({ where:{role:'2'}})
            countObj.categoriesCount = await models['categories'].count({})
            countObj.songsCount = await models['songs'].count({})
            countObj.singerCount = await models['users'].count({ where:{role:'1'}})


            res.render('admin/dashboard/index',{
                title: 'dashboard',
                countObj: countObj
            });
        } catch (err) {
            console.log(err);
            return helper.error(res, err);
        }
    },

    profile: function async(req, res) {
        try{
            const adminData = req.session.admin;
            res.render('admin/profile/index',{
                admin: adminData,
                title: '',
            });
        } catch(err) {
            console.log(err);
            return helper.error(res, err);
        }
    },

    updateProfile: async function (req, res) {
        try{
            let v = new Validator( req.body, {
                name: 'required', 
                phone: 'required', 
                // confirm_password: 'required|same:password'
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

            let upadteAdmin = await models['users'].findOne({ 
                where:{
                    id:req.session.admin.id
                }
            })
            upadteAdmin.name = req.body.name
            upadteAdmin.phone = req.body.phone
            if (req.files && req.files.image) {
                let imageName = helper.fileUpload(req.files.image, 'admin', 'uploads');
                upadteAdmin.image = imageName
            }
            upadteAdmin.save();
            let message = 'Profile updated successfully.';
            req.flash('flashMessage', { color: 'success', message }); 
            res.redirect('/admin/profile')
        } catch(err) {
            console.log(err);
            return helper.error(res, err);
        }
    },

    updatePassword : async function (req,res ) {
        try {
            console.log(req.body,"-------req.body----------");
            let v = new Validator( req.body, {
                old_password: 'required', 
                new_password: 'required', 
                confirm_password: 'required|same:new_password'
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

            const message = '';
            let upadteAdmin = await models['users'].findOne({
                where:{
                    id:req.session.admin.id
                }
            })
            
            console.log(upadteAdmin,"-------upadteAdmin----------");
            console.log(upadteAdmin.password,"-------password----------");
            // return
            let c_pass = req.body.old_password
            let db_pass = upadteAdmin.password
            const match = await helper.comparePass(c_pass, db_pass)
            if(!match){
                res.render('admin/profile/index',{
                    message:'Current Password is not correct!',
                    title:'',
                    admin: upadteAdmin
                })
            }

            let new_password = await helper.bcryptHash(req.body.new_password, saltRounds);
            console.log(new_password,"---------new_password----------")
            upadteAdmin.password = new_password;
            upadteAdmin.save();
            let message1 = 'Password updated successfully.';
            req.flash('flashMessage', { color: 'success', message : message1 }); 
            res.redirect('/admin/profile')
        }catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    logout: async (req, res) => {   
        try {     
            req.session.authenticated = false;
            req.session.admin = {};
            req.flash('flashMessage', { color: 'success', message: 'Logged out Successfully.' });
            res.redirect('/admin/login');
        } catch(err) {
            console.log(err);
            return helper.error(res, err);
        }
    },

}