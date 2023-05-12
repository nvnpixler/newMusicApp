const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const Op = sequelize.Op
const { Validator } = require('node-input-validator');
const saltRounds = 10;
const modelName = "categories";

module.exports = {
    index: async(req, res)=>{
        try{
            let list = await models[modelName].findAll({
                order:[['position','ASC']]
            });
            res.render('admin/category/index',{
                data: list,
                title: 'category',
            });
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    create: function async(req, res) {
        try{
            res.render('admin/category/add',{
                title: 'category',
            }); 
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    store: async function (req, res) {
        try{
            let v = new Validator( req.body, {
                // description: 'required',
                name: 'required',
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
                    name:req.body.name
                }
            });

            if(checkName){
                req.flash('flashMessage', { color: 'error', message: 'Language already exists!' });
                res.redirect('/admin/category/create')
            } else {
                let image = ''
                if (req.files && req.files.image) {
                    let imageName = helper.fileUpload(req.files.image, 'category', 'uploads');
                    image = imageName
                }
                let body = {
                    name: req.body.name,
                    description: req.body.description ? req.body.description : '',
                    image: image,
                }
                await models[modelName].create(body)

                let message = 'Language added successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/category/list')
            }  
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
            if(data){
                res.render('admin/category/edit',{
                    title: 'category',
                    data
                });
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Language not exists!' });
                res.redirect('/admin/category/list')
            } 
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    update: async function(req, res) {
        try{
            let v = new Validator( req.body, {
                // description: 'required',
                name: 'required',
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
                    req.flash('flashMessage', { color: 'error', message: 'Language already exists!' });
                    res.redirect(`/admin/category/edit/${req.params.id}`)
                } else {
                    data.name = req.body.name
                    data.description = req.body.description ? req.body.description : ''
                    if (req.files && req.files.image) {
                        let imageName = helper.fileUpload(req.files.image, 'category', 'uploads');
                        data.image = imageName
                    }
                    data.save();
    
                    let message = 'Language updated successfully!';
                    req.flash('flashMessage', { color: 'success', message }); 
                    res.redirect('/admin/category/list')
                }
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Language not exists!' });
                res.redirect('/admin/category/list')
            }
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    update_status: async function (req, res) {
        try{
            let checkCategory = await models[modelName].findOne({
                where:{
                    id:req.params.id
                }
            });
            if(checkCategory){
                checkCategory.status = checkCategory.status == '1' ? '0' : '1';
                checkCategory.save();
                let message = 'Status updated successfully!';
                req.flash('flashMessage', { color: 'success', message }); 
                res.redirect('/admin/category/list')
            } else {
                req.flash('flashMessage', { color: 'error', message: 'Language already exists!' });
                res.redirect('/admin/category/list')
            }  
        } catch(err){
            console.log(err);
            return helper.error(res, err);
        }
    },

    change_order: async(req,res) => {

        try {
    
            console.log(req.body,'---req.body----');
    
            // return
    
            const selectedData = req.body.selectedData;
            const currentModule = req.body.moduleName
            console.log(selectedData,'---selectedData----');
            // return
    
            // console.log(JSON.parse(req.body))
            
            let getAllData = await models[currentModule].findAll({
                where: {
                    id: {
                        [Op.notIn] : selectedData
                    }
                },
                attributes: ['id']
            });
    
            getAllData.forEach(data => selectedData.push(data.id));
    
            console.log(getAllData,'------getAllData--------')
    
            let result = await Promise.all(selectedData.map((id, idx) => {
                console.log('id',id)
                return  models[currentModule].update({
                    position: idx+1
                },{
                    where: {
                        id:id
                    }
                })
            }))
    
            console.log(selectedData,'---------selectedData222--------');
    
            return res.json(result)
    
        } catch (error) {
            console.log('error', error)
        }
    
    }

}