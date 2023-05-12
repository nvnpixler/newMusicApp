const path = require('path');
const multer = require('multer')
// import { S3 } from "@aws-sdk/client-s3";
// import multerS3 from 'multer-s3';

// const s3 = new S3({
//     region: 'us-east-1',
//     credentials: {
//         accessKeyId: 'AKIAVA366ZE6HJ3FQI5T',
//         secretAccessKey: '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'
//     }
// });

/*-------------------Image Upload vai Multer---------------------------*/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(req.file)
        cb(null, 'public/uploads/videoThumnails/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const imgExtansionFilter = (req, file, cb) => {
    console.log(file.mimetype)
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    }
    else {
        return cb(new Error('Only .png, .jpeg format allowed!'));
    }
}

const imgUploader = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10 // 10MB limit 
    },
    fileFilter: imgExtansionFilter
});

/*-------------------Image or video Upload vai Multer S3---------------------------*/

// const fileExtansionFilter = (req, file, cb) => {
//     console.log(file.mimetype)
//     if (file.mimetype === 'application/pdf' || file.mimetype === 'image/jpeg' || file.mimetype === 'application/doc' || file.mimetype === 'image/png' ) {
//         cb(null, true)
//     }
//     else {
//         return cb(new Error('Only .pdf .doc .png .jpg format allowe'));
//     }
// }
// const awsVideoUpload = multer({
//     storage: multerS3({
//         s3: s3,
//         // acl: "public-read",
//         bucket: "abraham-ering-ott",
//         key: function (req, file, cb) {
//             cb(null, Date.now() + file.originalname)
//         }
//     }),
   
// })
// const awsFileUpload = multer({
//     storage: multerS3({
//         s3: s3,
//         // acl: "public-read",
//         bucket: "abraham-ering-ott-file-bucket",
//         key: function (req, file, cb) {
//             cb(null, Date.now() + file.originalname)
//         }
//     }),
//     limits: {
//         fileSize: 1024 * 1024 * 20
//     },
//     fileFilter: fileExtansionFilter
// })

module.exports = {imgUploader}