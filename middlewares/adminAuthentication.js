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

    if (appDebug) {
        return checkAdminLogin(req, res, next);
    }

    if(req.session.authenticated == undefined) {
        req.flash('flashMessage', { color: 'error', message: 'Session expired.' });
        return res.redirect('/admin/login');
    }

    // if (![0].includes(req.session.admin.role)) {
    //     req.session.authenticated = false;
    // }

    if (req.session.authenticated == true) {
        const admin = await User.findOne({
            where: {
                id: req.session.admin.id,
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
        req.session.admin = admin;
        global.adminData = admin;
        console.log(global.adminData, '===========>adminData');

        return next();
    } else {
        req.flash('flashMessage', { color: 'error', message: 'Please login first.' });
        const originalUrl = req.originalUrl.split('/')[1];
        // return res.redirect(`/${originalUrl}`);
        return res.redirect(`/${originalUrl}/login`);
    }

    function checkAdminLogin(req, res, next){
        const admin = { 
            "id": 1,
            "email": 'admin@admin.com',
            "password":
            '$2y$10$bS0vTtK6SQe/MhKHrbRKS.EJ65jPF3inyK2vk349bmpy4AYwXO8.O',
            "name": 'Music App Admin',
            "phone": '1234567890',
            "image":
            'http://localhost:1122/uploads/admin/e9c0debc-3993-48fe-84c4-4eb98381adfd.jpg',
            "created": 1609910856,
            "updated": 1609910856,
            "createdAt": "2021-01-06T05:26:54.000Z",
            "updatedAt": "2021-09-16T14:14:40.000Z"
        } 

        req.session.admin = admin;
        global.adminData = admin;
        return next();
    }
}