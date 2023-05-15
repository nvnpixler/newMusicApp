const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const jwt = require('jsonwebtoken');
const secretKey = jwtSecretKey;
const saltRounds = 10;
const { Validator } = require('node-input-validator');

const modelName = "users";
module.exports = {

    file_upload: async function (req, res, next) {
        try {
            let v = new Validator( req.body, {
                type: 'required|in:image,video', 
                folder: 'required|string', 
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            if (req.files == null) {
                return helper.failed(res, "Please select image")
            }

            console.log("req.body ------------ ", req.body)
            console.log("req.files ------------ ", req.files)
            let PAYLOAD = req.body;
            var FILE_TYPE = PAYLOAD.type; // image,video,etc
            var FOLDER = req.body.folder; //PAYLOAD.folder;// user,category,products,etc

            var image_data = [];
            if (req.files && req.files.image && Array.isArray(req.files.image)) {
                for (var imgkey in req.files.image) {
                    var image_url = await helper.fileUploadMultiparty(req.files.image[imgkey], FOLDER, FILE_TYPE);
                    image_data.push(image_url)
                }
                return res.status(200).json({
                    status: true,
                    code: 200,
                    message: 'Successufully',
                    body: image_data
                });
            } else if (req.files.image.name != "") {
                var image_url = await helper.fileUploadMultiparty(req.files.image, FOLDER, FILE_TYPE);
                image_data.push(image_url)
                return res.status(200).json({
                    status: true,
                    code: 200,
                    message: 'Successufully',
                    body: image_data
                });
            } else {
                return res.status(400).json({
                    status: false,
                    code: 400,
                    message: "Error - Image can't be empty",
                    body: []
                });
            }
        } catch (err) {
            console.log(err)
            return helper.failed(res, err)
        }
    },

    signup: async (req, res) => {
        try {
            let v = new Validator( req.body, {
                name: 'required', 
                email: 'required|email', 
                password: 'required',
                country_code: 'required',
                phone: 'required',
                isOtpRequired: 'required|in:0,1',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let checkEmail = await models[modelName].findOne({
                where: {
                    email: req.body.email,
                    // role: req.body.role ? req.body.role : '2',
                    role: '2',
                },
                raw: true
            });

            if (checkEmail) {
                return helper.error(res, "Email already exists");
            }

            let checkPhone = await models[modelName].findOne({
                where: {
                    country_code: req.body.country_code,
                    phone: req.body.phone,
                },
                raw: true
            });

            if (checkPhone) {
                return helper.error(res, "Phone no. already exists");
            }

            if (req.body.password) {
                req.body.password = await helper.bcryptHash(req.body.password, saltRounds)
            }

            var imageString = "";
            if (req.body.image) {
                imageString = JSON.parse(req.body.image);
            }

            req.body.image = (imageString != '') ? imageString[0].image : '';
            req.body.image_thumb = (imageString != '') ? imageString[0].thumbnail : '';

            let time = helper.unixTimestamp();

            req.body.login_time = time;

            let create_user = await models[modelName].create(req.body);

            if (create_user) {
                create_user = create_user.toJSON();
                delete create_user.password;

                if(parseInt(req.body.isOtpRequired) == 1){
                    let otp = 1111;
                    // let otp = Math.floor(1000 + Math.random() * 9000);
                    await helper.sendSmsDigimiles(req.body.phone,otp);
    
                    await models[modelName].update({ 
                        otp: otp,
                        is_otp_verified : 0,
                    }, {
                        where: { 
                            id: create_user.id
                        }
                    })
                }

                let token = jwt.sign({
                    data: {
                        id: create_user.id,
                        // email: create_user.email,
                        login_time: create_user.login_time,
                    }
                }, secretKey);
                console.log(token)

                let getData = await models[modelName].findOne({
                    where: {
                        id: create_user.id
                    },
                    raw: true
                });

                getData.token = token;
                let checkUserGenres = await models['user_genres'].count({
                    where:{
                        user_id: getData.id,
                    },
                });
                
                let checkUserLanguage = await models['user_languages'].count({
                    where:{
                        user_id: getData.id,
                    },
                });
    
                getData.is_language_added  = checkUserLanguage > 0 ? 1 : 0;
                getData.is_genres_added  = checkUserGenres > 0 ? 1 : 0;

                return helper.success(res, "Sign up successfull", getData);
            } else {
                return helper.failed(res, "Error. Please try again.")
            }
        } catch (err) {
            return helper.failed(res, err);
        }
    }, 

    social_login: async (req, res) => {
        try{
            let v = new Validator( req.body, {
                social_id: 'required', 
                social_type: 'required', 
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let checkSocialId = await models[modelName].findOne({
                where: {
                    social_id: req.body.social_id,
                    social_type: req.body.social_type
                }
            });
           
            let time = helper.unixTimestamp();

            req.body.login_time = time
            if (!checkSocialId) {
                if(req.body.email && req.body.email != ''){
                    const user_data = await models[modelName].findOne({
                        where: {
                            email: req.body.email,
                            role: '2',
                        },
                        raw : true
                    }); 
                    if (user_data && user_data.email != '' && user_data.email != undefined) {
                        let UpdateAuth = await models[modelName].update(
                            req.body
                            , {
                            where: {
                                id: user_data.id,
                            }
                        });
                        
                        let finduser = await models[modelName].findOne({
                            where: {
                                id: user_data.id
                            }
                        });
                        let getuser = finduser.toJSON();
                        let msg = "Login Sccessfully !"
        
                        let token = jwt.sign({
                            data: {
                                id: getuser.id,
                                login_time: getuser.login_time,
                            }
                        }, secretKey);
                    
                        let getDetail = await models[modelName].findOne({
                            where: {
                                id: getuser.id,
                            },
                            raw : true
                        });
                        getDetail.token = token;
        
                        let checkUserGenres = await models['user_genres'].count({
                            where:{
                                user_id: getDetail.id,
                            },
                        });
                        
                        let checkUserLanguage = await models['user_languages'].count({
                            where:{
                                user_id: getDetail.id,
                            },
                        });
            
                        getDetail.is_language_added  = checkUserLanguage > 0 ? 1 : 0;
                        getDetail.is_genres_added  = checkUserGenres > 0 ? 1 : 0;
                        
                        return helper.success(res, msg, getDetail);
                        // let message = 'Email already exist!';
                        // return helper.failed(res, message);
                    } 
                }
                // let signup_otp = 1111;
                // let signup_otp = Math. floor(1000 + Math. random() * 9000);
                
                var create_user = await models[modelName].create(req.body);
                
                create_user = create_user.toJSON();
                
                let token = jwt.sign({
                    data: {
                        id: create_user.id,
                        login_time: create_user.login_time,
                    }
                }, secretKey);
                
                let getDetail = await models[modelName].findOne({
                    where: {
                        id: create_user.id,
                    },
                    raw : true
                });
                getDetail.token = token;

                let checkUserGenres = await models['user_genres'].count({
                    where:{
                        user_id: getDetail.id,
                    },
                });
                
                let checkUserLanguage = await models['user_languages'].count({
                    where:{
                        user_id: getDetail.id,
                    },
                });
    
                getDetail.is_language_added  = checkUserLanguage > 0 ? 1 : 0;
                getDetail.is_genres_added  = checkUserGenres > 0 ? 1 : 0;
                
                let msg = 'User Sign up successfully';
                return helper.success(res, msg, getDetail);
                
            } else {
                let UpdateAuth = await models[modelName].update(
                    req.body
                    , {
                    where: {
                        social_id: req.body.social_id,
                    }
                });
                
                let finduser = await models[modelName].findOne({
                    where: {
                        social_id: req.body.social_id
                    }
                });
                let getuser = finduser.toJSON();
                let msg = "Login Sccessfully !"

                let token = jwt.sign({
                    data: {
                        id: getuser.id,
                        login_time: getuser.login_time,
                    }
                }, secretKey);
            
                let getDetail = await models[modelName].findOne({
                    where: {
                        id: getuser.id,
                    },
                    raw : true
                });
                getDetail.token = token;

                let checkUserGenres = await models['user_genres'].count({
                    where:{
                        user_id: getDetail.id,
                    },
                });
                
                let checkUserLanguage = await models['user_languages'].count({
                    where:{
                        user_id: getDetail.id,
                    },
                });
    
                getDetail.is_language_added  = checkUserLanguage > 0 ? 1 : 0;
                getDetail.is_genres_added  = checkUserGenres > 0 ? 1 : 0;
                
                return helper.success(res, msg, getDetail);
            }

        } catch (error) {
            return helper.failed(res, error)
        }
    },

    login: async (req, res) => {
        try {
            let v = new Validator( req.body, {
                email: 'required|email', 
                password: 'required',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let getUser = await models[modelName].findOne({
                where: {
                    email: req.body.email,
                    role:'2'
                },
                raw: true,
                nest: true
            });

            if (!getUser) {
                return helper.failed(res, "Incorrect Email or Password.");
            }
            checkPassword = await helper.comparePass(req.body.password, getUser.password);

            if (!checkPassword) {
                return helper.failed(res, "Email or Password did not match, Please try again.");
            }

            if(getUser.status == '0'){
                return helper.failed(res, "Your account is deactivated!");
            }

            delete getUser.password;

            let time = helper.unixTimestamp();

            console.log(time)

            await models[modelName].update({ 
                login_time: time,
                device_token:req.body.device_token,
                device_type:req.body.device_type
            }, {
                where: {
                    id: getUser.id
                }
            })

            let getData = await models[modelName].findOne({
                where: {
                    id: getUser.id
                },
                raw: true
            });
            
            var token = jwt.sign({
                data: {
                    id: getData.id,
                    // email: create_user.email,
                    login_time: getData.login_time,
                }
            }, secretKey);
            console.log(token)
            getData.token = token;
            delete getData.password;

            // let checkUserGenres = await models['user_genres'].count({
            //     where:{
            //         user_id: getData.id,
            //     },
            // });
            
            // let checkUserLanguage = await models['user_languages'].count({
            //     where:{
            //         user_id: getData.id,
            //     },
            // });

            // getData.is_language_added  = checkUserLanguage > 0 ? 1 : 0;
            // getData.is_genres_added  = checkUserGenres > 0 ? 1 : 0;

            // console.log(getData, '==========>getUser');

            return helper.success(res, "Login successfully.", getData);
        } catch (err) {
            return helper.failed(res, err);
        }
    },

    login_with_phone: async (req, res) => {
        try {
            let v = new Validator( req.body, {
                country_code: 'required', 
                phone: 'required',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let getUser = await models[modelName].findOne({
                where: {
                    country_code: req.body.country_code,
                    phone: req.body.phone,
                    role: '2'
                },
                raw: true,
                nest: true
            });

            if (!getUser) {
                let otp = Math.floor(1000 + Math.random() * 9000);
                await helper.sendSmsDigimiles(req.body.phone,otp);
                return helper.success(res, "Phone no. doesn't exist",{is_account_exist:0,otp:otp});
            }

            if(getUser.status == '0'){
                return helper.failed(res, "Your account is deactivated!");
            }
            
            let time = helper.unixTimestamp();
            // let otp = 1111;
            let otp = Math.floor(1000 + Math.random() * 9000);
            await helper.sendSmsDigimiles(req.body.phone,otp);

            await models[modelName].update({ 
                otp: otp,
                is_otp_verified : 0,
                login_time: time,
                device_token:req.body.device_token,
                device_type:req.body.device_type
            }, {
                where: {
                    id: getUser.id
                }
            })

            // await helper.twilioResponse("Your Music app verification code is "+otp, getUser.country_code+getUser.phone);

            let getData = await models[modelName].findOne({
                where: {
                    id: getUser.id
                },
                raw: true
            });
        
            var token = jwt.sign({
                data: {
                    id: getData.id,
                    // email: create_user.email,
                    login_time: getData.login_time,
                }
            }, secretKey);
            
            getData.token = token;

            let checkUserGenres = await models['user_genres'].count({
                where:{
                    user_id: getData.id,
                },
            });
            
            let checkUserLanguage = await models['user_languages'].count({
                where:{
                    user_id: getData.id,
                },
            });

            getData.is_language_added  = checkUserLanguage > 0 ? 1 : 0;
            getData.is_genres_added  = checkUserGenres > 0 ? 1 : 0;
            getData.is_account_exist  = 1;

            console.log(getData, '==========>getUser');

            return helper.success(res, "Otp sent successfully.", getData);
        } catch (err) {
            return helper.failed(res, err);
        }
    },
    
    resend_otp: async (req, res) => {
        try {
            let v = new Validator( req.body, {
                country_code: 'required', 
                phone: 'required',
                // email: 'required',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            if(req.body.email){
                let checkEmail = await models[modelName].findOne({
                    where: {
                        email: req.body.email,
                        role: '2',
                    },
                    raw: true
                });

                if (checkEmail) {
                    return helper.error(res, "Email already exists");
                }
            }

            let checkPhone = await models[modelName].findOne({
                where: {
                    country_code: req.body.country_code,
                    phone: req.body.phone,
                },
                raw: true
            });

            if (checkPhone) {
                return helper.error(res, "Phone no. already exists");
            }

            /* let getUser = await models[modelName].findOne({
                where: {
                    country_code: req.body.country_code,
                    phone: req.body.phone,
                    role: '2'
                },
                raw: true,
                nest: true
            });

            if (!getUser) {
                return helper.failed(res, "Incorrect phone no.");
            } */
            
            // let otp = 1111;
            let otp = Math.floor(1000 + Math.random() * 9000);
            /* await models[modelName].update({ 
                otp: otp,
                is_otp_verified : 0,
                device_token:req.body.device_token,
                device_type:req.body.device_type
            }, {
                where: {
                    id: getUser.id
                }
            }) */
            await helper.sendSmsDigimiles(req.body.phone,otp);
            // await helper.twilioResponse("Your Music app verification code is "+otp, req.body.country_code+req.body.phone);

            /* let getData = await models[modelName].findOne({
                where: {
                    id: getUser.id
                },
                raw: true
            }); */
            
            // console.log(getData, '==========>getUser');
            let obj = {
                otp
            }

            return helper.success(res, "Otp sent successfully.", obj);
        } catch (err) {
            return helper.failed(res, err);
        }
    },

    verify_otp: async (req, res) => {
        try {
            let v = new Validator( req.body, {
                otp: 'required',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            if (req.body.otp != req.user.otp ) {
                return helper.failed(res, 'Invalid otp!')
            }

            await models[modelName].update({
                    is_otp_verified: 1,
                    otp: 0
                },
                {
                    where: {
                        id: req.user.id
                    }
                }
            );

            return helper.success(res, "Otp verified successfully.", {});
        } catch (err) {
            return helper.failed(res, err);
        }
    },

    profile: async (req, res) => {
        try {
            return helper.success(res, "Get profile.", req.user);
        } catch (error) {
            return helper.failed(res, error)
        }
    },

    edit_profile: async (req, res) => {
        try {
            let v = new Validator( req.body, {
                name: 'required', 
                // email: 'required|email',
                // country_code: 'required',
                // phone: 'required',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }
            
            if (req.body.email) {
                let check_email_exists = await models[modelName].findOne({
                    where: {
                        email: req.body.email,
                        role: '2',
                        [Op.not]: {
                            id: req.user.id
                        }
                    },
                    raw: true
                });
                if (check_email_exists) {
                    return helper.failed(res, "This email already exists.")
                } else {
                    req.body.email = req.body.email
                }
            }
            
            if (req.body.phone) {
                let check_phone_exists = await models[modelName].findOne({
                    where: {
                        country_code: req.body.country_code,
                        phone: req.body.phone,
                        [Op.not]: {
                            id: req.user.id
                        }
                    },
                    raw: true
                });
                
                if (check_phone_exists) {
                    return helper.failed(res, "This phone number is already exists.")
                } else {
                    req.body.phone = req.body.phone
                }
            }
            console.log(req.body, 'req.body==================');
    
            let update_profile = await models[modelName].update(req.body, {
                where: {
                    id: req.user.id
                }
            });
            /* let update_profile = await models[modelName].update({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
            }, {
                where: {
                    id: req.user.id
                }
            }); */

            if (update_profile) {
                if (req.body.image && req.body.image != '') {
                    let imageString = JSON.parse(req.body.image);

                    await models['users'].update({
                        image: imageString[0].image,
                        image_thumb: imageString[0].thumbnail
                    }, {
                        where: {
                            id: req.user.id
                        }
                    });
                }

                let getData = await models[modelName].findOne({
                    where: {
                        id: req.user.id
                    }
                });

                return helper.success(res, "Profile updated successfully.", getData);
            } else {
                return helper.failed(res, "Error. Please try again.")
            }

        } catch (error) {
            return helper.failed(res, error)
        }
    },

    change_password: async (req, res) => {
        try {
            let v = new Validator( req.body, {
                old_password: 'required', 
                new_password: 'required|different:old_password',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let checkPassword = await helper.comparePass(req.body.old_password, req.user.password);
            // console.log(checkPassword)
            // return

            if (checkPassword == false) {
                throw "Please enter correct old password";
            } else {
                let updatePassword = await models[modelName].update({
                    password: helper.bcryptHash(req.body.new_password)
                }, {
                    where: {
                        id: req.user.id
                    }
                });

                if (updatePassword) {
                    return helper.success(res, 'Password  updated successfully.', {});
                } else {
                    throw "Error...Please try again";
                }
            }

        } catch (err) {
            return helper.failed(res, err);
        }
    },

    logout: async (req, res) => {
		try {
			let CheckAuth = await models[modelName].findOne({
                where: {
                    id: req.user.id
                },
                raw: true
            });

			if (CheckAuth) {
                await models[modelName].update({ 
                    login_time: '0',
                    device_token:""
                }, {
                    where: {
                        id: CheckAuth.id
                    }
                })
                let msg = "User Logged Out Successfully !"
                return helper.success(res, msg, {});
            } else {
                let msg = "Invalid Token !";
                return helper.failed(res, msg)
            }
		} catch (error) {
			console.log(error)
			return helper.failed(res, error)
		}
    },

    forgot_password: async (req, res) => { // DONE
        try {
            let v = new Validator( req.body, {
                email: 'required|email',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let checkUserId = await models[modelName].findOne({
                where : {
                    email : req.body.email,
                    role:'2'
                },
                raw:true
            });

            if(!checkUserId) {
                let msg = "Email does not exists"
                return helper.failed(res, msg)
            }

            let email_forgot_password_hash = (checkUserId.id).toString()+helper.create_auth()+helper.create_auth();
            email_forgot_password_hash = email_forgot_password_hash.toUpperCase();

            await models[modelName].update({
                reset_token: email_forgot_password_hash
            }, {
                where: {
                    id: checkUserId.id
                }
            });

            let fullUrl = req.protocol + '://' + req.get('host');

            // let html = `<a href="http://${req.get('host')}/api/reset_password/${email_forgot_password_hash}">Click here to reset password</a>`;

            let html = await helper.forgot_password_html(fullUrl,email_forgot_password_hash);

            await helper.sendEmail({
                from: 'cqlsystest52@gmail.com',
                to: checkUserId.email.trim(),
                subject: 'Popil Tunes App Reset Password',
                html: html
            });

            console.log(html)

            let msg = 'Please follow reset password link sent to your email.';
            return helper.success(res, msg, {});

        } catch (err) {
            return helper.failed(res, err);
        }
    },

    reset_password_form: async (req, res) => {
        try {
            let id = req.params.id;

            let find = await models[modelName].findOne({
                where : {
                    reset_token: id
                },
                raw:true
            });

            if(find) {
                if(find.reset_token.trim() == '') {
                    res.render('api/reset_password/verifyEmail', {
                        title: 'Link expired.',
                        code: 1
                    });
                } else {
                    res.render('api/reset_password/reset_password_form', {
                        // title: 'Your email has been verified successfully.'
                        hash: find.reset_token
                    });
                }
            } else {
                res.render('api/reset_password/verifyEmail', {
                    title: 'Link expired.',
                    code: 0
                });
            }
        } catch (err) {
            return helper.failed(res, err);
        }
    },

    reset_password: async (req, res) => {
        try {
            let hash = req.body.hash;
            let newPassword = req.body.new_password;
            let confirmPassword = req.body.confirm_password;

            let find = await models[modelName].findOne({
                where : {
                    reset_token: hash
                },
                raw:true
            });

            if(find) {
                if(newPassword.trim() == confirmPassword.trim()) {
                    // const Hash = crypto.createHash('sha1').update(confirmPassword).digest('hex');
                    const Hash = helper.bcryptHash(confirmPassword);
      
                    let resetPassword = await models['users'].update({
                        password: Hash
                    }, {
                        where: {
                            id: find.id
                        }
                    });

                    if(resetPassword) {
                        await models[modelName].update({
                            reset_token: ''
                        }, {
                            where: {
                                id: find.id
                            }
                        });

                        res.render('api/reset_password/verifyEmail', {
                            title: 'Password reset successfully.'
                        });
                    } else {
                        let message = 'Error. Please try again.';
                        req.flash('flashMessage', { color: 'error', message });
                        res.redirect(`/api/reset_password/${hash}`);
                    }
                } else {
                    let message = 'Passwords do not match';
                    req.flash('flashMessage', { color: 'error', message });
                    res.redirect(`/api/reset_password/${hash}`);
                }
            } else {
                let message = 'Link expired';
                req.flash('flashMessage', { color: 'error', message });
                res.redirect(`/api/reset_password/${hash}`);
            }
        } catch (err) {
            return helper.failed(res, err);
        }
    },

    cms: async (req, res) => {
		try {
            let v = new Validator( req.query, {
                type: 'required|integer|in:1,2', //1=privacy, 2=terms
            });
            let errorsResponse = await helper.checkValidation(v)
            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }
            
            let all_list = await models['pages'].findOne({
                where:{
                    id:req.query.type
                },
            });
            let msg = "cms data";
            return helper.success(res, msg, all_list);
        } catch (error) {
			console.log(error)
			return helper.failed(res, error)
		}
    },

    contact_us: async (req, res) => {
        try {
            let v = new Validator( req.body, {
                name: 'required',
                email: 'required|email', 
                message: 'required',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            await models['contact_us'].create(req.body);

            return helper.success(res, "Contact us added successfully.", {});
        } catch (err) {
            return helper.failed(res, err);
        }
    },

    language_list: async (req, res) => {
		try {
            
            // let language_list = await models['languages'].findAll({
            let language_list = await models['categories'].findAll({
                where:{
                    status:'1'
                },
                order:[['position', 'ASC']]
            });
            let genres_list = await models['genres'].findAll({
                where:{
                    status:'1'
                },
            });
            let all_list ={
                language_list,
                genres_list
            }
            let msg = "Language data";
            return helper.success(res, msg, all_list);
        } catch (error) {
			console.log(error)
			return helper.failed(res, error)
		}
    },
    
    genres_list: async (req, res) => {
		try {
            
            let all_list = await models['genres'].findAll({
                where:{
                    status:'1'
                },
            });
            let msg = "Genres data";
            return helper.success(res, msg, all_list);
        } catch (error) {
			console.log(error)
			return helper.failed(res, error)
		}
    },

    save_genres_language: async (req, res) => {
        try {
            let v = new Validator( req.body, {
                genres: 'required',
                language: 'required',
            });
            let errorsResponse = await helper.checkValidation(v)

            if(errorsResponse){
                return helper.failed(res, errorsResponse)
            }

            let genresList = []
            let languageList = []
            if(req.body.genres){
                let genres = JSON.parse(req.body.genres)
                await Promise.all( genres.map( async(item) =>{
                    let obj = {}
                    obj.user_id = req.user.id
                    obj.genres_id = item
                    genresList.push(obj)
                    console.log('--obj--',obj,'--obj--',genresList);
                    return item
                }))
                
                await models['user_genres'].destroy({
                    where:{
                        user_id: req.user.id,
                    },
                });
                
                await models['user_genres'].bulkCreate(genresList);
            }

            if(req.body.language){
                let language = JSON.parse(req.body.language)
                await Promise.all( language.map( async(item) =>{
                    let obj = {}
                    obj.user_id = req.user.id
                    obj.language_id = item
                    languageList.push(obj)
                    console.log('--obj--',obj,'--obj--',languageList);
                    return item
                }))
                
                await models['user_languages'].destroy({
                    where:{
                        user_id: req.user.id,
                    },
                });
                
                await models['user_languages'].bulkCreate(languageList);
            }

            return helper.success(res, "Addedd successfully.", {});
        } catch (err) {
            return helper.failed(res, err);
        }
    },

    avatar_list: async (req, res) => {
		try {
            
            let all_list = await models['avatars'].findAll({
                where:{
                    status:'1'
                },
            });
            let msg = "Avatar data";
            return helper.success(res, msg, all_list);
        } catch (error) {
			console.log(error)
			return helper.failed(res, error)
		}
    },

}