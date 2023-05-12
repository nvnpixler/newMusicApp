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
                    role:"1"
                },
                order:[['id','DESC']]
            });
            res.render('admin/singer/index',{
                users: list,
                title: 'singer',
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
                    email:req.body.email,
                    role: '1',
                }
            });

            let checkPhone = await models[modelName].findOne({
                where:{
                    phone:req.body.phone
                }
            });

            if(checkEmail){
                req.flash('flashMessage', { color: 'error', message: 'Email already exists!.' });
                res.redirect('/admin/singer/create')
            } else if(checkPhone){
                req.flash('flashMessage', { color: 'error', message: 'Phone already exists!.' });
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
                    is_popil_buds: req.body.is_popil_buds ? 1 : 0,
                    role:'1'
                }
                await models[modelName].create(body)

                let fullUrl = req.protocol + '://' + req.get('host');

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
                                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Your account has been created</h1>
                                                        <span
                                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                            We sent you your login credentials. To login to your dashboard, click the
                                                            following link and login with the credentials.
                                                        </p>
                                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">Name: ${req.body.name}</p>
                                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">Email: ${req.body.email}</p>
                                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">Password: ${req.body.password}</p>
                                                        <a href="${fullUrl}/singer/login"
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
                    to: req.body.email.trim(),
                    subject: 'Music App Account created',
                    html: html
                });

                let message = 'Singer added successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/singer/list')
            }
            
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    delete: async function (req, res) {
        try{
            console.log(req.body,'--req.body--');
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
                req.flash('flashMessage', { color: 'error', message: 'Singer not exists!.' });
                res.redirect('/admin/singer/list')
            } else {
                await models[modelName].destroy({
                    where:{
                        id:req.params.id
                    }
                });
                let message = 'Singer deleted successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/singer/list')
            }
            
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

}