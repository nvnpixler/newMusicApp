var express = require('express');
var router = express.Router();

const singerAuthentication = require('../middlewares/singerAuthentication');

var authController = require('../controllers/Singer/AuthController');
var songController = require('../controllers/Singer/SongController');
var transactionController = require('../controllers/Singer/TransactionController');
var verificationController = require('../controllers/Singer/VerificationController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*-------------------Singer Basic route---------------------------*/
// router.get('/', authController.loginPage);
router.get('/forgot_password', authController.forgot_password_page);
router.post('/forgot_password_send', authController.forgot_password);
router.get('/reset_password/:id', authController.reset_password_form);
router.post('/update_reset_password', authController.reset_password);
router.get('/login', authController.loginPage);
router.post('/loginSinger', authController.loginSubmit);
router.get('/dashboard', singerAuthentication, authController.dashboard);
router.get('/profile', singerAuthentication, authController.profile);
router.get('/getProfile', singerAuthentication, authController.getProfile);
router.post('/updateProfile', singerAuthentication, authController.updateProfile);
router.get('/logout', singerAuthentication, authController.logout);
router.post('/updatePassword', singerAuthentication, authController.updatePassword);

/*-------------------Songs route---------------------------*/
router.get('/song/list', singerAuthentication, songController.index);
router.get('/song/create', singerAuthentication, songController.create);
router.get('/song/view/:id', singerAuthentication, songController.view);
router.post('/song/store', singerAuthentication, songController.store);
router.get('/song/edit/:id', singerAuthentication, songController.edit);
router.post('/song/update/:id', singerAuthentication, songController.update);
router.get('/song/delete/:id', singerAuthentication, songController.delete);

/*-------------------Transaction route---------------------------*/
router.get('/transaction/list', singerAuthentication, transactionController.index);

/*-------------------Verification route---------------------------*/
router.get('/verification/form', singerAuthentication, verificationController.form);
router.post('/verification/update_form', singerAuthentication, verificationController.update_form);
router.get('/verification/otp_form', singerAuthentication, verificationController.otp_form);
router.get('/verification/submit_otp', singerAuthentication, verificationController.submit_otp);

module.exports = router;
