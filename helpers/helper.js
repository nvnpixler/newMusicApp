/*
|----------------------------------------------------------------------------------------------------------------------------
|   Exporting all methods
|----------------------------------------------------------------------------------------------------------------------------
*/
const bcrypt = require('bcrypt');
const crypto = require('crypto');
var path = require('path');
const uuid = require('uuid').v4;
const nodemailer = require('nodemailer');
const fileExtension = require('file-extension')
const sharp = require('sharp') //for image thumbnail
const Thumbler = require('thumbler');//for video thumbnail
const util = require('util')
const fs = require('fs-extra')
const models = require('../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
var axios = require('axios');

// for push notification
const FCM = require('fcm-node');
const apn = require("apn");
const options = {
    token: {
        key: __dirname + "/AuthKey_5H324VNUH2.p8",
        keyId: "5H324VNUH2",
        teamId: "J979QZLC8X",
    },
    production: false,
};
const apnProvider = new apn.Provider(options);

const constants = require('../config/constants')
const client = require('twilio')(twilioSID, twilioToken);

module.exports = {

    checkValidation: async (v) => {
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
        return errorsResponse;
    },

    success: function (res, message = '', body = {}) {
        return res.status(200).json({
            'success': true,
            'code': 200,
            'message': message,
            'body': body
        });
    },

    error: function (res, err, req) {
        console.log(err, '===========================>error in helper');
        let code = (typeof err === 'object') ? (err.code) ? err.code : 403 : 403;
        let message = (typeof err === 'object') ? (err.message ? err.message : '') : err;
        if (req) {
            req.flash('flashMessage', {
                color: 'error',
                message
            });
            const originalUrl = req.originalUrl.split('/')[1];
            return res.redirect(`/${originalUrl}`);
        }

        return res.status(code).json({
            'success': false,
            'message': message,
            'code': code,
            'body': {}
        });
    },

    failed: function (res, message = '') {
        message = (typeof message === 'object') ? (message.message ? message.message : '') : message;
        return res.status(400).json({
            'success': false,
            'code': 400,
            'message': message,
            'body': {}
        });
    },

    comparePass: async (requestPass, dbPass) => {
        dbPass = dbPass.replace('$2y$', '$2b$');
        const match = await bcrypt.compare(requestPass, dbPass);
        return match;
    },

    bcryptHash: (myPlaintextPassword, saltRounds = 10) => {
        const bcrypt = require('bcrypt');
        const salt = bcrypt.genSaltSync(saltRounds);
        let hash = bcrypt.hashSync(myPlaintextPassword, salt);
        hash = hash.replace('$2b$', '$2y$');
        return hash;
    },

    unixTimestamp: function () {
        var time = Date.now();
        var n = time / 1000;
        return time = Math.floor(n);
    },

    fileUpload: (file, folder = 'users', parentFolder = 'uploads') => {
        let file_name_string = file.name;
        var file_name_array = file_name_string.split(".");
        var file_extension = file_name_array[file_name_array.length - 1];
        var result = "";
        result = uuid();
        let name = result + '.' + file_extension;
        let nameWithPath = '/' + parentFolder + '/' + folder + '/'+ name;
        file.mv(`public/${parentFolder}/${folder}/${name}`, function (err) {
            if (err) throw err;
        });
        return nameWithPath;
    },

    sendEmail(object) {
        try {
            var transporter = nodemailer.createTransport(constants.mailAuth);
            var mailOptions = object;

            console.log(global.mailAuth);
            console.log(mailOptions);
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log('error', error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        } catch (err) {
            throw err;
        }
    },

    create_auth() {
        try {
            let current_date = (new Date()).valueOf().toString();
            let random = Math.random().toString();
            return crypto.createHash('sha1').update(current_date + random).digest('hex');
        } catch (err) {
            throw err;
        }
    },

    readFile: async (path) => {
        console.log("  ************ readFile *******************")
        console.log(path, "  ************ pathreadFile *******************")
        return new Promise((resolve, reject) => {
            const readFile = util.promisify(fs.readFile);
            readFile(path).then((buffer) => {
                resolve(buffer);
            }).catch((error) => {
                reject(error);
            });
        });
    },

    writeFile: async (path, buffer) => {
        console.log("  ************ write file *******************")
        return new Promise((resolve, reject) => {
            const writeFile1 = util.promisify(fs.writeFile);
            writeFile1(path, buffer).then((buffer) => {
                resolve(buffer);
            }).catch((error) => {
                reject(error);
            });
        });
    },

    //function createVideoThumb(fileData, thumbnailPath){
    createVideoThumb: async (fileData, thumbnailPath) => {
        var VIDEO_THUMBNAIL_TIME = '00:00:02'
        var VIDEO_THUMBNAIL_SIZE = '300x200'
        var VIDEO_THUMBNAIL_TYPE = 'video'
        return new Promise(async (resolve, reject) => {
            Thumbler({
                type: VIDEO_THUMBNAIL_TYPE,
                input: fileData,
                output: thumbnailPath,
                time: VIDEO_THUMBNAIL_TIME,
                size: VIDEO_THUMBNAIL_SIZE // this optional if null will use the desimention of the video
            }, function (err, path) {
                if (err) reject(err);
                resolve(path);
            });
        });
    },

    fileUploadMultiparty: async function (FILE, FOLDER, FILE_TYPE) {
        try {
            var FILENAME = FILE.name; // actual filename of file
            var FILEPATH = FILE.tempFilePath; // will be put into a temp directory

            THUMBNAIL_IMAGE_SIZE = 300
            THUMBNAIL_IMAGE_QUALITY = 100

            let EXT = fileExtension(FILENAME); //get extension
            EXT = EXT ? EXT : 'jpg';
            FOLDER_PATH = FOLDER ? (FOLDER + "/") : ""; // if folder name then add following "/" 
            var ORIGINAL_FILE_UPLOAD_PATH = "/public/uploads/" + FOLDER_PATH;
            var THUMBNAIL_FILE_UPLOAD_PATH = "/public/uploads/" + FOLDER_PATH;
            var THUMBNAIL_FILE_UPLOAD_PATH_RETURN = "/uploads/" + FOLDER_PATH;
            var NEW_FILE_NAME = (new Date()).getTime() + "-" + "file." + EXT;
            var NEW_THUMBNAIL_NAME = (new Date()).getTime() + "-" + "thumbnail" + "-" + "file." + ((FILE_TYPE == "video") ? "jpg" : EXT);

            let NEWPATH = path.join(__dirname, '../', ORIGINAL_FILE_UPLOAD_PATH, NEW_FILE_NAME);
            let THUMBNAIL_PATH = path.join(__dirname, '../', ORIGINAL_FILE_UPLOAD_PATH, NEW_THUMBNAIL_NAME);

            let FILE_OBJECT = {
                "image": '',
                "thumbnail": '',
                "fileName": FILENAME,
                "folder": FOLDER,
                "file_type": FILE_TYPE
            }

            let BUFFER = await this.readFile(FILEPATH); //read file from temp path
            await this.writeFile(NEWPATH, BUFFER); //write file to destination

            FILE_OBJECT.image = THUMBNAIL_FILE_UPLOAD_PATH_RETURN + NEW_FILE_NAME;

            let THUMB_BUFFER = "";

            if (FILE_TYPE == 'image') { // image thumbnail code
                var THUMB_IMAGE_TYPE = (EXT == "png") ? "png" : "jpeg";
                THUMB_BUFFER = await sharp(BUFFER)
                    .resize(THUMBNAIL_IMAGE_SIZE)
                    .toFormat(THUMB_IMAGE_TYPE, {
                        quality: THUMBNAIL_IMAGE_QUALITY
                    })
                    .toBuffer();
                // FILE_OBJECT.thumbnail = THUMBNAIL_FILE_UPLOAD_PATH + NEW_THUMBNAIL_NAME;
                FILE_OBJECT.thumbnail = THUMBNAIL_FILE_UPLOAD_PATH_RETURN + NEW_THUMBNAIL_NAME;
                await this.writeFile(THUMBNAIL_PATH, THUMB_BUFFER);
            } else if (FILE_TYPE == "video") { // video thumbnail code
                await this.createVideoThumb(NEWPATH, THUMBNAIL_PATH, NEW_THUMBNAIL_NAME);
                FILE_OBJECT.thumbnail = THUMBNAIL_FILE_UPLOAD_PATH_RETURN + NEW_THUMBNAIL_NAME;
            } else {
                FILE_OBJECT.thumbnail = ''
            }
            return FILE_OBJECT;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },

    twilioResponse: async function (body,to_phone) {
        console.log(twilioNumber,'---twilioNumber----','---to_phone---',to_phone);
        await client.messages.create({
            body: body,
            from: twilioNumber,
            to: to_phone
        })
        .then(message => {
            console.log("message ------------- ",message)
            return true;
        }).catch(err => {
            console.log("err ------------- ",err)
            return false;
        }).done();
        return true;
    },
    
    sendSmsDigimiles: async function (to_phone,otp) {
        var config = {
        method: 'get',
        url: `http://route.digimiles.in/bulksms/bulksms?username=DG35-yokmo&password=digimile&type=0&dlr=1&destination=${to_phone}&source=YOKINT&message=OTP for Popil Tunes is ${otp} and valid for 10 minutes. Do not share this OTP with anyone (Powered by Yokmo Interactive)&entityid=1501340910000044693&tempid=1507165796367404913`,
        headers: { }
        };

        console.log(config,'---digimiles url-----------------');

        axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
            return true;
        })
        .catch(function (error) {
            console.log(error);
            return false;
        });
        return true;
    },

    saveNotification: async (data) => {
        try {
            let saveData =  await models['notifications'].save(data)
            return saveData;
        } catch (err) {
            throw err;
        }
    },

    send_push_to_multiple_device: async (device_token, device_type, data_to_send) => {
        // console.log(data_to_send, "data_to_send--------------------");
        let data_sent_to_push ={
            title: 'Popil Hymns App',
            body: data_to_send.message,
            message: data_to_send.message,
            device_token: device_token,
            type : data_to_send.type,
            sender_id : data_to_send.sender_id,
            sender_name : data_to_send.sender_name,
            sender_image : data_to_send.sender_image,
        }

        if (device_type == 2) {
            console.log("--------------push for ios-------------");
            
            if (device_token && device_token.length > 0) {
                var myDevice = device_token;
                // var myDevice = `2b27f1c2cc7c1cc2519a51f89c2ec51f90a918b7e46cdede84cb46e86fb70fc7`
                var note = new apn.Notification();
                let bundleId = "com.cqlsys.Nearby";
                console.log("----bundleId----", bundleId);
        
                note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                note.badge = 1;
                note.sound = "default";
        
                note.alert = data_sent_to_push;
                note.payload = { data: data_sent_to_push };
                
                note.topic = bundleId;
                console.log("-----------send note for ios----------", note);
        
                apnProvider
                .send(note, myDevice)
                .then((result) => {
                    console.log("send result", result); 
                })
                .catch((err) => {
                    console.error("error while sending user notification to ios", err);
                });
            } 
        }
        if (device_type == 1) {
            console.log("--------------push for android-------------");
            if (device_token && device_token.length > 0) {
                let notiObj = {}
        
                notiObj.title = data_sent_to_push.title
                notiObj.message = data_sent_to_push.message
                notiObj.body = data_sent_to_push
                notiObj.type = data_sent_to_push.type
                
                let message = {
                    registration_ids: device_token,
                    data: notiObj
                };
        
                console.log('---message---',message,'----message----')
                var serverKey = 'AAAAoTZodcw:APA91bFmY1L8YiW9EoWUaYdwD7rdsI-GP8ruo_cmTGkagiFduxABi2g-5PvRQAmOWPT6UhIJWV_fR3oL5Ez28Nl9V8tqUZ2SvcwOSDUQwGoLKGWZs2POKjPABlLxX0GxAzr7jWi7e2gi'; //put your server key here
                var fcm = new FCM(serverKey);
        
                fcm.send(message, function (err, response) {
                    if (err) {
                        console.log("Something has gone wrong!", message);
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                });
                return fcm;
            }
        }
      },
    
    getAllUsersByRole: async (role) => {
        try {
           let getUsers =  await models['users'].findAll({
                where: {
                    role:role
                },
                raw:true
            })
            return getUsers;
        } catch (err) {
            throw err;
        }
    },
    
    getAllUsersById: async (id) => {
        try {
           let getUsers =  await models['users'].findAll({
                where: {
                    id:id
                },
                raw:true
            })
            return getUsers;
        } catch (err) {
            throw err;
        }
    },
    
    getUsersById: async (id) => {
        try {
           let getUsers =  await models['users'].findOne({
                where: {
                    id:id
                },
                raw:true
            })
            return getUsers;
        } catch (err) {
            throw err;
        }
    },
    
    getSongById: async (id) => {
        try {
           let getData =  await models['songs'].findOne({
                where: {
                    id:id
                },
                raw:true
            })
            return getData;
        } catch (err) {
            throw err;
        }
    },

    getVideoById: async (id) => {
        try {
           let getData =  await models['video_details'].findOne({
                where: {
                    id:id
                },
                raw:true
            })
            return getData;
        } catch (err) {
            throw err;
        }
    },
    
    getPlaylistById: async (id) => {
        try {
           let getData =  await models['playlists'].findOne({
                where: {
                    id:id
                },
                raw:true
            })
            return getData;
        } catch (err) {
            throw err;
        }
    },
    
    getBuySongListGroupBy: async (data) => {
        try {
           let getData =  await models['buy_songs'].findAll({
                group:[data],
                raw:true
            })
            return getData;
        } catch (err) {
            throw err;
        }
    },
    
    getSongIdArray: async (data,key) => {
        try {
           let ids = data.map((d) => {return d[key]})
           return ids
        } catch (err) {
            throw err;
        }
    },

    getTrendingSongListGroupBy: async (data) => {
        try {
            let current_date = moment().format('YYYY-MM-DD')
            let last2_week_date = moment().subtract(2, 'week')
            last2_week_date = moment(last2_week_date).format('YYYY-MM-DD')
            console.log(current_date,'--current_date--','--last2_week_date--',last2_week_date);
           let getData =  await models['user_actions'].findAll({
                attributes:{
                    include:[
                        [sequelize.fn('sum', sequelize.col('count')), 'total_count'],
                        [sequelize.literal(`DATE_FORMAT(created_at, "%Y-%m-%d")`),'date']
                    ]
                },
                where:{
                    type:'1' //play song
                },
                group:[data],
                having:{
                    date:{
                        [Op.gte]: last2_week_date
                    }
                },
                // order: [[sequelize.literal('total_count'), 'DESC']],
                order: [['count', 'DESC'],['updated_at','DESC']],
                raw:true
            })
            return getData;
        } catch (err) {
            throw err;
        }
    },

    getSongSingerListGroupBy: async (data,ids) => {
        try {
           let getData =  await models['songs'].findAll({
                group:[data],
                where:{
                    id: ids
                },
                raw:true
            })
            return getData;
        } catch (err) {
            throw err;
        }
    },

    getPopilPicksSongListGroupBy: async (data,user_id) => {
        try {
           let getData =  await models['user_genres'].findAll({
                where:{
                    user_id:user_id
                },
                raw:true
            })
            return getData;
        } catch (err) {
            throw err;
        }
    },
    
    getLanguageBasedSongListGroupBy: async (data,user_id) => {
        try {
           let getData =  await models['user_languages'].findAll({
                where:{
                    user_id:user_id
                },
                raw:true
            })
            return getData;
        } catch (err) {
            throw err;
        }
    },
    
    getHallOfFameSongListGroupBy: async (data,user_id) => {
        try {
           let getData =  await models['user_actions'].findOne({
                where:{
                    user_id:user_id,
                    type:'1'
                },
                order:[['id','DESC']],
                raw:true
            })
            return getData;
        } catch (err) {
            throw err;
        }
    },
    
    getMySongActionList: async (group_by,user_id) => {
        try {
            let getData =  await models['user_actions'].findAll({
                where:{
                    user_id:user_id,
                },
                group:[group_by],
                raw:true
            })
            return getData;
        } catch (err) {
            throw err;
        }
    },
    
    getMyRecentPlayedList: async (group_by,user_id,type) => {
        try {
            let getData =  await models['user_actions'].findAll({
                where:{
                    user_id:user_id,
                    type:type
                },
                order:[['updated_at','DESC']],
                group:[group_by],
                raw:true
            })
            return getData;
        } catch (err) {
            throw err;
        }
    },

    getMyLoveSongList: async (user_id) => {
        try {
            let getData =  await models['loved_songs'].findAll({
                where:{
                    user_id:user_id,
                },
                raw:true
            })
            return getData;
        } catch (err) {
            throw err;
        }
    },
    
    getLovedSongListBySongId: async (song_id) => {
        try {
            let getData =  await models['loved_songs'].findAll({
                where:{
                    song_id:song_id,
                },
                group:['user_id'],
                raw:true
            })
            return getData;
        } catch (err) {
            throw err;
        }
    },
    
    getMyBuySongList: async (user_id) => {
        try {
            let getData =  await models['buy_songs'].findAll({
                where:{
                    user_id:user_id,
                },
                raw:true
            })
            return getData;
        } catch (err) {
            throw err;
        }
    },

    forgot_password_html: async (fullUrl,email_forgot_password_hash)=>{
        try {
            let html = `<!doctype html>
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
                                                    <a href="${fullUrl}/api/reset_password/${email_forgot_password_hash}"
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
            
            </html>`

            return html;
        } catch (err) {
            throw err;
        }
    },

    
}