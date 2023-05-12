const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const { Validator } = require('node-input-validator');
const modelName = "users";
const bankModelName = "singer_banks";

module.exports = {
    form: async(req, res)=>{
        try{
            let getSingerData = await models[modelName].findOne({
                include:[
                    {
                        model:models[bankModelName]
                    }
                ],
                where:{
                    id:req.session.singer.id
                },
                raw:true,
                nest:true
            })
            console.log(getSingerData,'-----------getSingerData------------');
            res.render('singer/verification/form',{
                data: getSingerData,
                title: 'verification',
            });
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    update_form: async function (req, res) {
        try{
            console.log(req.body,'---req.body---',req.files,'--------req.files-------');
            // return
            let v = new Validator( req.body, {
                name: 'required', 
                country_code: 'required', 
                phone: 'required', 
                bank_name: 'required',
                account_holder_name: 'required',
                account_number: 'required',
                ifsc_code: 'required',
                // branch_address: '',
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

            // let otp = 1111;
            let otp = Math.floor(1000 + Math.random() * 9000);
            await helper.sendSmsDigimiles(req.body.phone,otp);
            // await helper.twilioResponse("Your Music app verification code is "+otp, req.body.country_code+req.body.phone);

            let upadteAdmin = await models['users'].findOne({ 
                where:{
                    id:req.session.singer.id
                }
            })
            upadteAdmin.name = req.body.name
            upadteAdmin.country_code = req.body.country_code
            upadteAdmin.phone = req.body.phone
            upadteAdmin.otp = otp
            upadteAdmin.is_otp_verified = 0
            if (req.files && req.files.image) {
                let imageName = helper.fileUpload(req.files.image, 'users', 'uploads');
                upadteAdmin.image = imageName
            }
            if (req.files && req.files.aadhar_image) {
                let imageName = helper.fileUpload(req.files.aadhar_image, 'users', 'uploads');
                upadteAdmin.aadhar_image = imageName
            }
            if (req.files && req.files.aadhar_image_back) {
                let imageName = helper.fileUpload(req.files.aadhar_image_back, 'users', 'uploads');
                upadteAdmin.aadhar_image_back = imageName
            }
            upadteAdmin.save();

            let checkSingerBank = await models[bankModelName].findOne({
                where:{
                    user_id : req.session.singer.id
                }
            })
            if(checkSingerBank){
                checkSingerBank.account_holder_name = req.body.account_holder_name
                checkSingerBank.bank_name = req.body.bank_name
                checkSingerBank.account_number = req.body.account_number
                checkSingerBank.ifsc_code = req.body.ifsc_code
                checkSingerBank.branch_address = req.body.branch_address ? req.body.branch_address : ''
                checkSingerBank.save();
            } else {
                await models[bankModelName].create({
                    user_id : req.session.singer.id,
                    account_holder_name : req.body.account_holder_name,
                    bank_name : req.body.bank_name,
                    account_number : req.body.account_number,
                    ifsc_code : req.body.ifsc_code,
                    branch_address : req.body.branch_address ? req.body.branch_address : ''
                })
            }
            let message = `Verify the otp sent to your phone number '${req.body.country_code}-${req.body.phone}'`;
            req.flash('flashMessage', { color: 'success', message }); 
            res.redirect('/singer/verification/otp_form')
        } catch(err) {
            console.log(err);
            return helper.error(res, err);
        }
    },

    otp_form: async(req, res)=>{
        try{
            let getTerms = await models['pages'].findOne({
                where:{
                    slug:'term_condition_singer'
                }
            })
            res.render('singer/verification/verify_otp',{
                data: getTerms,
                title: 'verification',
            });
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },
    
    submit_otp: async(req, res)=>{
        try{
            let getSinger = await models['users'].findOne({ 
                where:{
                    id:req.session.singer.id
                },
                raw:true
            })
            if(getSinger.otp != req.query.otp){
                let message = 'Invalid Otp.';
                req.flash('flashMessage', { color: 'error', message }); 
                res.redirect('/singer/verification/otp_form')
            } else {
                await models['users'].update({
                    otp:0,
                    is_otp_verified:1
                },{ 
                    where:{
                        id:req.session.singer.id
                    }
                })
                let message = 'Otp verified successfully.';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/singer/dashboard')
            }
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

}