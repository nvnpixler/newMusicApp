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
            if(!req.session.singerAuthenticated){
                res.render('singer/login',{
                    message:''
                });
            } else{
                res.redirect('/singer/dashboard');
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
                    role:'1'
                },
                raw: true,
                nest: true
            });

            if (!getUser) {
                req.flash('flashMessage', { color: 'error', message: 'Incorrect Email or Password.' });
                res.redirect('/singer/login');
                return
                // return helper.error(res, "Incorrect Email or Password.");
            }
            checkPassword = await helper.comparePass(req.body.password, getUser.password);

            if (!checkPassword) {
                req.flash('flashMessage', { color: 'error', message: 'Email or Password did not match, Please try again.' });
                res.redirect('/singer/login');
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

            req.session.singer = getUser;
            req.session.singerAuthenticated = true;

            req.flash('flashMessage', { color: 'success', message: 'Logged in Successfully.' });
            res.redirect('/singer/dashboard');
        } catch (err) {
            return helper.error(res, err);
        }
    },

    dashboard: async (req, res) => {
        try {
            let countObj = {}
            countObj.userCount = await models['users'].count({ where:{role:'2'}})
            countObj.categoriesCount = await models['categories'].count({})
            countObj.songsCount = await models['songs'].count({where:{user_id:req.session.singer.id}})
            countObj.singerCount = await models['users'].count({ where:{role:'1'}})


            res.render('singer/dashboard/index',{
                title: 'dashboard',
                countObj: countObj
            });
        } catch (err) {
            console.log(err);
            return helper.error(res, err);
        }
    },

    getProfile: function async(req, res) {
        try{
            const adminData = req.session.singer;
            res.render('singer/profile/profile',{
                admin: adminData,
                title: '',
            });
        } catch(err) {
            console.log(err);
            return helper.error(res, err);
        }
    },

    profile: function async(req, res) {
        try{
            const adminData = req.session.singer;
            res.render('singer/profile/index',{
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
                    id:req.session.singer.id
                }
            })
            upadteAdmin.name = req.body.name
            upadteAdmin.phone = req.body.phone
            if (req.files && req.files.image) {
                let imageName = helper.fileUpload(req.files.image, 'users', 'uploads');
                upadteAdmin.image = imageName
            }
            upadteAdmin.save();
            let message = 'Profile updated successfully.';
            req.flash('flashMessage', { color: 'success', message }); 
            res.redirect('/singer/getProfile')
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
                    id:req.session.singer.id
                }
            })
            
            console.log(upadteAdmin,"-------upadteAdmin----------");
            console.log(upadteAdmin.password,"-------password----------");
            // return
            let c_pass = req.body.old_password
            let db_pass = upadteAdmin.password
            const match = await helper.comparePass(c_pass, db_pass)
            if(!match){
                res.render('singer/profile/index',{
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
            res.redirect('/singer/getProfile')
        }catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    logout: async (req, res) => {   
        try {     
            req.session.singerAuthenticated = false;
            req.session.singer = {};
            req.flash('flashMessage', { color: 'success', message: 'Logged out Successfully.' });
            res.redirect('/singer/login');
        } catch(err) {
            console.log(err);
            return helper.error(res, err);
        }
    },

    forgot_password_page: function async(req, res) {
        try{
            if(!req.session.singerAuthenticated){
                res.render('singer/forgot_password',{
                    message:''
                });
            } else{
                res.redirect('/singer/dashboard');
            }
        } catch (err) {
            console.log(err,'-------errorr-----------');
            return helper.error(res, err);
        }
    },

    forgot_password: async (req, res) => { // DONE
        try {
            let v = new Validator( req.body, {
                email: 'required',
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
                // return helper.error(res, errorsResponse)
                req.flash('flashMessage', { color: 'error', message: errorsResponse });
                res.redirect('/singer/forgot_password');
                return
            }

            let checkUserId = await models['users'].findOne({
                where:{
                    email: req.body.email.trim(),
                    role:'1'
                }
            });

            if(!checkUserId) {
                let msg = "Email does not exists"
                // return helper.error(res, msg)
                req.flash('flashMessage', { color: 'error', message: msg });
                res.redirect('/singer/forgot_password');
                return
            }

            let email_forgot_password_hash = (checkUserId.id).toString()+helper.create_auth()+helper.create_auth()+helper.create_auth();
            email_forgot_password_hash = email_forgot_password_hash.toUpperCase();

            checkUserId.reset_token = email_forgot_password_hash
            checkUserId.save();
            
            let fullUrl = req.protocol + '://' + req.get('host');

            // let html = `<a href="${fullUrl}/api/reset_password/${email_forgot_password_hash}">Click here to reset password</a>`;
            let html = `
            <!doctype html>
            <html lang="en-US">
            
            <head>
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                <title>Reset Password</title>
                <meta name="description" content="Reset Password.">
                <style type="text/css">
                    a:hover {text-decoration: underline !important;}
                </style>
            </head>
            
            <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
                <!--100% body table-->
                <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                    style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                    <tr>
                        <td>
                            <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                                align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="height:80px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="text-align:center;">
                                      <a href="#" title="logo">
                                        <img width="60" src="${fullUrl}/images/logo.png" title="logo" alt="logo" style="height: 192px; width: 192px;">
                                      </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:20px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td>
                                        <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                            style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                            <tr>
                                                <td style="height:40px;">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:0 35px;">
                                                    <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                                        requested to reset your password</h1>
                                                    <span
                                                        style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                        We cannot simply send you your old password. A unique link to reset your
                                                        password has been generated for you. To reset your password, click the
                                                        following link and follow the instructions.
                                                    </p>
                                                    <a href="${fullUrl}/singer/reset_password/${email_forgot_password_hash}"
                                                        style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                                        Password</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="height:40px;">&nbsp;</td>
                                            </tr>
                                        </table>
                                    </td>
                                <tr>
                                    <td style="height:20px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="height:80px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <!--/100% body table-->
            </body>
            
            </html>`;

            await helper.sendEmail({
                from: 'cqlsystesting19@gmail.com',
                to: checkUserId.email.trim(),
                subject: 'Music App Reset Password',
                html: html
            });

            // console.log(html)

            let msg = 'Please follow reset password link sent to your email.';
            // return helper.success(res, msg, checkUserId);
            req.flash('flashMessage', { color: 'success', message: msg });
            res.redirect('/singer/login');
            return

        } catch (err) {
            return helper.error(res, err);
        }
    },

    reset_password_form: async (req, res) => {
        try {
            let id = req.params.id;

            let find = await models['users'].findOne({
                where:{
                    reset_token: id.trim()
                },
                raw:true
            });

            if(find) {
                if(find.reset_token.trim() == '') {
                    res.render('singer/reset_password/verifyEmail', {
                        title: 'Link expired.',
                        code: 1
                    });
                } else {
                    res.render('singer/reset_password/reset_password_form', {
                        // title: 'Your email has been verified successfully.'
                        hash: find.reset_token
                    });
                }
            } else {
                res.render('singer/reset_password/verifyEmail', {
                    title: 'Link expired.',
                    code: 0
                });
            }
        } catch (err) {
            return helper.error(res, err);
        }
    },

    reset_password: async (req, res) => {
        try {
            let hash = req.body.hash;
            let newPassword = req.body.new_password;
            let confirmPassword = req.body.confirm_password;

            let find = await models['users'].findOne({
                where:{
                    reset_token: hash.trim()
                }
            });

            if(find) {
                if(newPassword.trim() == confirmPassword.trim()) {
                    const Hash = await helper.bcryptHash(req.body.new_password, saltRounds)

                    find.password = Hash
                    find.reset_token = ''
                    find.save();
                    req.flash('flashMessage', { color: 'success', message: 'Password changed successfully. Login to Continue' });
                    res.redirect('/singer/login');
                    // res.render('singer/reset_password/verifyEmail', {
                    //     title: 'Password changed successfully.',
                    //     message:'Password changed successfully',
                    // });
                } else {
                    let message = 'Passwords do not match';
                    // req.flash('info', message)
                    req.flash('flashMessage', { color: 'success', message });
                    // req.flash('flashMessage', { color: 'error', message });
                    res.redirect(`/singer/reset_password/${hash}`);
                }
            } else {
                let message = 'Link expired';
                // req.flash('info', message)
                req.flash('flashMessage', { color: 'error', message });
                res.redirect(`/singer/reset_password/${hash}`);
            }
        } catch (err) {
            return helper.error(res, err);
        }
    },

}