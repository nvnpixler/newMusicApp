const sequelize = require('sequelize');
const { Op } = sequelize;
const models = require('../models');
// const helper = require('../helpers/helper');

const User = models.users;

module.exports = async (req, res, next) => {
    const ignoreRoutes = [
        '/',
        '/login',
        '/loginSubmit'
    ];

    if (ignoreRoutes.includes(req.url)) return next();

    if (appSingerDebug) {
        return checkSingerLogin(req, res, next);
    }

    if(req.session.singerAuthenticated == undefined) {
        req.flash('flashMessage', { color: 'error', message: 'Session expired.' });
        return res.redirect('/singer/login');
    }

    // if (![0].includes(req.session.admin.role)) {
    //     req.session.singerAuthenticated = false;
    // }

    if (req.session.singerAuthenticated == true) {
        const singer = await User.findOne({
            where: {
                id: req.session.singer.id,
            },
            // attributes: {
            //     include: [
            //         [sequelize.literal(`(IF (admins.image='', '${baseUrl}/uploads/default/avatar-1.png', CONCAT('${baseUrl}/uploads/user/', admins.image)) )`), 'image']
            //     ]
            // },
            raw: true,
            nest: true
        });
        //-------------------------------------------------------------------------------------------
        req.session.singer = singer;
        global.singerData = singer;
        console.log(global.singerData, '===========>singerData');

        return next();
    } else {
        req.flash('flashMessage', { color: 'error', message: 'Please login first.' });
        const originalUrl = req.originalUrl.split('/')[1];
        // return res.redirect(`/${originalUrl}`);
        return res.redirect(`/${originalUrl}/login`);
    }

    function checkSingerLogin(req, res, next){
        const singer = { 
            "id": 1,
            "email": 'singer1@yopmail.com',
            "password":
            '$2y$10$bS0vTtK6SQe/MhKHrbRKS.EJ65jPF3inyK2vk349bmpy4AYwXO8.O',
            "name": 'Music App Singer',
            "phone": '1234567890',
            "image":
            'http://localhost:1122/uploads/admin/e9c0debc-3993-48fe-84c4-4eb98381adfd.jpg',
            "created": 1609910856,
            "updated": 1609910856,
            "createdAt": "2021-01-06T05:26:54.000Z",
            "updatedAt": "2021-09-16T14:14:40.000Z"
        } 

        req.session.singer = singer;
        global.singerData = singer;
        return next();
    }
}