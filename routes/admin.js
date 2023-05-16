var express = require('express');
var router = express.Router();

const adminAuthentication = require('../middlewares/adminAuthentication');
const uploadFile = require('../middlewares/fileUploader');
var authController = require('../controllers/Admin/AuthController');
var pageController = require('../controllers/Admin/PageController');
var singerController = require('../controllers/Admin/SingerController');
var userController = require('../controllers/Admin/UserController');
var categoryController = require('../controllers/Admin/CategoryController');
var genresController = require('../controllers/Admin/GenresController');
var songController = require('../controllers/Admin/SongController');
var podcastController = require('../controllers/Admin/PodcastController');
var transactionController = require('../controllers/Admin/TransactionController');
var contactUsController = require('../controllers/Admin/ContactUsController');
var avatarController = require('../controllers/Admin/AvatarController');
var popilPicksController = require('../controllers/Admin/PopilPicksController');
let videoController = require('../controllers/Admin/VideoController');
let responseController = require('../controllers/Api/ResponseController');

/*-------------------Admin Basic route---------------------------*/
// router.get('/', authController.loginPage);
router.get('/admin/login', authController.loginPage);
router.post('/admin/loginAdmin', authController.loginSubmit);
router.get('/admin/dashboard', adminAuthentication, authController.dashboard);
router.get('/admin/profile', adminAuthentication, authController.profile);
router.post('/admin/updateProfile', adminAuthentication, authController.updateProfile);
router.get('/admin/logout', adminAuthentication, authController.logout);
router.post('/admin/updatePassword', adminAuthentication, authController.updatePassword);

/*-------------------User route---------------------------*/
router.get('/admin/user/list', adminAuthentication, userController.index);
router.get('/admin/user/view/:id', adminAuthentication, userController.view);
router.get('/admin/user/create', adminAuthentication, userController.create);
router.post('/admin/user/store', adminAuthentication, userController.store);
router.get('/admin/user/update_status/:id', adminAuthentication, userController.update_status);

/*-------------------Singer route---------------------------*/
router.get('/admin/singer/list', adminAuthentication, singerController.index);
router.get('/admin/singer/create', adminAuthentication, singerController.create);
router.post('/admin/singer/store', adminAuthentication, singerController.store);
router.get('/admin/singer/delete/:id', adminAuthentication, singerController.delete);

/*-------------------Category route---------------------------*/
router.get('/admin/category/list', adminAuthentication, categoryController.index);
router.get('/admin/category/create', adminAuthentication, categoryController.create);
router.post('/admin/category/store', adminAuthentication, categoryController.store);
router.get('/admin/category/edit/:id', adminAuthentication, categoryController.edit);
router.post('/admin/category/update/:id', adminAuthentication, categoryController.update);
router.get('/admin/category/update_status/:id', adminAuthentication, categoryController.update_status);
router.post('/admin/category/change_order', categoryController.change_order);

/*-------------------Popil picks route---------------------------*/
router.get('/admin/popil_pick/list', adminAuthentication, popilPicksController.index);
router.get('/admin/popil_pick/song_list/:id', adminAuthentication, popilPicksController.popil_pick_song_list);
router.get('/admin/popil_pick/add_song_to_popil_pick/:popil_pick_id/:song_id', adminAuthentication, popilPicksController.add_song_to_popil_pick);
router.get('/admin/popil_pick/create', adminAuthentication, popilPicksController.create);
router.post('/admin/popil_pick/store', adminAuthentication, popilPicksController.store);
router.get('/admin/popil_pick/edit/:id', adminAuthentication, popilPicksController.edit);
router.post('/admin/popil_pick/update/:id', adminAuthentication, popilPicksController.update);
router.get('/admin/popil_pick/update_status/:id', adminAuthentication, popilPicksController.update_status);
router.get('/admin/popil_pick/delete/:id', adminAuthentication, popilPicksController.delete);

/*-------------------Avatar route---------------------------*/
router.get('/admin/avatar/list', adminAuthentication, avatarController.index);
router.get('/admin/avatar/create', adminAuthentication, avatarController.create);
router.post('/admin/avatar/store', adminAuthentication, avatarController.store);
router.get('/admin/avatar/edit/:id', adminAuthentication, avatarController.edit);
router.post('/admin/avatar/update/:id', adminAuthentication, avatarController.update);
router.get('/admin/avatar/update_status/:id', adminAuthentication, avatarController.update_status);
router.get('/admin/avatar/delete/:id', adminAuthentication, avatarController.delete);

/*-------------------Genres route---------------------------*/
router.get('/admin/genres/list', adminAuthentication, genresController.index);
router.get('/admin/genres/create', adminAuthentication, genresController.create);
router.post('/admin/genres/store', adminAuthentication, genresController.store);
router.get('/admin/genres/edit/:id', adminAuthentication, genresController.edit);
router.post('/admin/genres/update/:id', adminAuthentication, genresController.update);
router.get('/admin/genres/update_status/:id', adminAuthentication, genresController.update_status);

/*-------------------Songs route---------------------------*/
router.get('/admin/song/list', adminAuthentication, songController.index);
router.get('/admin/song/view/:id', adminAuthentication, songController.view);
router.get('/admin/song/create', adminAuthentication, songController.create);
router.get('/admin/genres/category/:id', adminAuthentication, songController.getCategory);
router.post('/admin/song/store', adminAuthentication, songController.store);
router.get('/admin/song/edit/:id', adminAuthentication, songController.edit);
router.post('/admin/song/update/:id', adminAuthentication, songController.update);
router.get('/admin/song/delete/:id', adminAuthentication, songController.delete);
router.get('/admin/song/podcast_list', adminAuthentication, songController.podcast_list);
router.get('/admin/song/update_podcast/:id', adminAuthentication, songController.update_podcast);

/*-------------------Podcast route---------------------------*/
router.get('/admin/podcast/list', adminAuthentication, podcastController.index);
router.get('/admin/podcast/view/:id', adminAuthentication, podcastController.view);
router.get('/admin/podcast/create', adminAuthentication, podcastController.create);
router.post('/admin/podcast/store', adminAuthentication, podcastController.store);
router.get('/admin/podcast/edit/:id', adminAuthentication, podcastController.edit);
router.post('/admin/podcast/update/:id', adminAuthentication, podcastController.update);
router.get('/admin/podcast/delete/:id', adminAuthentication, podcastController.delete);

/*-------------------Transaction route---------------------------*/
router.get('/admin/transaction/list', adminAuthentication, transactionController.index);

/*-------------------Contact us route---------------------------*/
router.get('/admin/contact_us/list', adminAuthentication, contactUsController.index);

/*-------------------Cms route---------------------------*/
router.get('/admin/cms/list', adminAuthentication, pageController.index);
router.get('/admin/cms/edit/:id', adminAuthentication, pageController.edit);
router.post('/admin/cms/update', adminAuthentication, pageController.update);

/*-------------------Website Routes---------------------------*/
var webHomePicksController = require('../controllers/Website/HomeController');

/* GET home page. */
router.get('/', webHomePicksController.home);
router.get('/about', webHomePicksController.about);
router.get('/terms', webHomePicksController.terms);
router.get('/privacy', webHomePicksController.privacy);
router.get('/contact_us', webHomePicksController.contact_us);

/*-------------------Video Category Routes---------------------------*/

router.get('/admin/video/list', adminAuthentication, videoController.index);
router.get('/admin/video/view/:id', adminAuthentication, videoController.view);
router.get('/admin/video/create', adminAuthentication, videoController.create);
router.get('/admin/genres/category/:id', adminAuthentication, videoController.getCategory);
router.post('/admin/video/store', adminAuthentication, videoController.store);
router.get('/admin/video/edit/:id', adminAuthentication, videoController.edit);
router.post('/admin/video/update/:id', adminAuthentication, videoController.update);
router.get('/admin/video/delete/:id', adminAuthentication, videoController.delete);



module.exports = router;
