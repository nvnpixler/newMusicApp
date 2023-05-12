var express = require('express');
var router = express.Router();
const requireAuthentication = require('../passport').authenticateUser;

var authController = require('../controllers/Api/AuthController');
var songController = require('../controllers/Api/SongController');
var podcastController = require('../controllers/Api/PodcastController');
var playlistController = require('../controllers/Api/PlaylistController');
var notificationController = require('../controllers/Api/NotificationController');
var lovedSongController = require('../controllers/Api/LovedSongController');
var buySongController = require('../controllers/Api/BuySongController');
let responseController = require('../controllers/Api/ResponseController');
//file upload
router.post('/file_upload',authController.file_upload);

//auth api
router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.post('/social_login',authController.social_login);
router.post('/forgot_password',authController.forgot_password);
router.get('/reset_password/:id', authController.reset_password_form);
router.post('/update_reset_password', authController.reset_password);
router.post('/login_with_phone',authController.login_with_phone);
router.post('/verify_otp',requireAuthentication, authController.verify_otp);
// router.post('/resend_otp',requireAuthentication, authController.resend_otp);
router.post('/resend_otp', authController.resend_otp);
router.get('/profile',requireAuthentication, authController.profile);
router.get('/logout',requireAuthentication, authController.logout);
router.post('/change_password',requireAuthentication, authController.change_password);
router.post('/edit_profile',requireAuthentication, authController.edit_profile);

//cms
router.get('/cms', authController.cms);
router.get('/avatar_list', authController.avatar_list);
router.get('/language_list', authController.language_list);
router.get('/genres_list', authController.genres_list);
router.post('/save_genres_language', requireAuthentication, authController.save_genres_language);

//contact_us
router.post('/contact_us', authController.contact_us);

//song api
router.get('/home_listing',requireAuthentication, songController.home_listing);
router.get('/get_home_data_by_type',requireAuthentication, songController.get_home_data_by_type);
router.post('/get_song_by_category',requireAuthentication, songController.get_song_by_category);
router.post('/get_song_by_genres',requireAuthentication, songController.get_song_by_genres);
router.post('/get_song_by_singer',requireAuthentication, songController.get_song_by_singer);
router.post('/get_song_by_popil_picks',requireAuthentication, songController.get_song_by_popil_picks);
router.post('/get_song_singer_by_search',requireAuthentication, songController.get_song_singer_by_search);
router.post('/action_on_song',requireAuthentication, songController.action_on_song);

//playlist api
router.get('/playlist_list',requireAuthentication, playlistController.playlist_list);
router.get('/playlist_detail/:id',requireAuthentication, playlistController.playlist_detail);
router.post('/add_playlist',requireAuthentication, playlistController.add_playlist);
router.post('/add_playlist_song',requireAuthentication, playlistController.add_playlist_song);
router.get('/playlist_delete/:id',requireAuthentication, playlistController.playlist_delete);
router.get('/playlist_song_delete/:id',requireAuthentication, playlistController.playlist_song_delete);

//notification api
router.get('/notification_list',requireAuthentication, notificationController.notification_list);
router.get('/notification_delete',requireAuthentication, notificationController.notification_delete);
router.get('/notification_status_update',requireAuthentication, notificationController.notification_status_update);

//love song api
router.get('/loved_song_list',requireAuthentication, lovedSongController.loved_song_list);
router.post('/love_unlove_song',requireAuthentication, lovedSongController.love_unlove_song);

//song buy api
router.get('/song_buy_list',requireAuthentication, buySongController.song_buy_list);
router.post('/buy_song',requireAuthentication, buySongController.buy_song);

//podcast api
router.get('/podcast/list',requireAuthentication, podcastController.list);
router.get('/podcast/type_list',requireAuthentication, podcastController.type_list);
router.post('/podcast/list_by_category',requireAuthentication, podcastController.list_by_category);

//User reponses api
router.get('/like_video',requireAuthentication, responseController.like_video);

module.exports = router;