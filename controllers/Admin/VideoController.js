const models = require('../../models');
const helper = require('../../helpers/helper');
const sequelize = require('sequelize');
const path = require('path');
const multer = require('multer')
const Joi = require('joi');
const saltRounds = 10;
const modelName = "video_details";
const { Validator } = require('node-input-validator');
let videoCategoryController = {
    async videoCategor(req, res, next) {
        let v = new Validator(req.body, {
            category: 'required',
            title: 'required',
            discription: 'required',
            language: 'required|array',
            duration: 'required',
            genre: 'required|array',
            isAdult: 'required',
            director: 'required',
            producer: 'required',
            character: 'required',
            production: 'required',
            sound: 'required',
            writer: 'required',
        });
        let errorsResponse = await helper.checkValidation(v)

        if (errorsResponse) {
            return helper.failed(res, errorsResponse)
        }
        const data = {
            category,
            title,
            videoTrailerURL,
            discription,
            videoThumnail: req.file.filename,
            released,
            year,
            language,
            duration,
            country,
            rating,
            genre,
            season,
            likes,
            isAdult,

            director,
            producer,
            character,
            production,
            sound,
            writer
        } = req.body
        try {
            let video_detail = await models[modelName].create(data);
            if (video_detail) {
                res.status(200).json({ status: true, result: 'New video added successfully' })
            }
            else {
                res.send("Internal Server Error")
            }
        }
        catch (err) {
            console.log(err)
            res.send(err)
        }
    },

    async getVideoCategory(req, res) {
        try {
            let list = await models[modelName].findAll({});
            res.json(list)
            // res.render('admin/category/index',{
            //     data: list,
            //     title: 'category',
            // });
        } catch (err) {
            return helper.error(res, err);
        }
    },
    async deletevideoCategory(req, res) {
        const id = req.params.id
        try {
            await models[modelName].destroy({
                where: {
                    id: id
                }
            })
            res.json({ status: true, message: "Category Deleted" })
        }
        catch (err) {
            res.json(err)
        }
    },
    updateVideoCategory: async function (req, res) {
        const updateVideoCategory = {
            category: req.body.category,
            title: req.body.title,
            videoTrailerURL: req.body.videoTrailerURL,
            discription: req.body.discription,
            released: req.body.released,
            videoThumnail: req.file.filename ? req.file.filename : "",
            year: req.body.year,
            language: req.body.language,
            duration: req.body.duration,
            country: req.body.country,
            genre: req.body.genre,
            season: req.body.season,
            isAdult: req.body.isAdult,
            director: req.body.director,
            producer: req.body.producer,
            character: req.body.character,
            production: req.body.production,
            sound: req.body.sound,
            writer: req.body.writer
        }
        try {
            await models[modelName].update(updateVideoCategory, { where: { id: req.params.id } })
                .then(() => {
                    res.json("updated...")
                })
                .catch((err) => {
                    res.json("Something went wrong", err)
                })
            // let message = 'Profile updated successfully.';
            // req.flash('flashMessage', { color: 'success', message });
            // res.redirect('/singer/getProfile')
        } catch (err) {
            console.log(err);
            return helper.error(res, err);
        }
    },
}

module.exports = videoCategoryController
