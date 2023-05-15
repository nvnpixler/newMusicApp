/*
|-------------------------------------------------------------------------------------------------------
| Constants File
|-------------------------------------------------------------------------------------------------------
| In this file all the constants set to globals for using them through out the project.
|
*/

global.moment = require('moment');

global.appPort = 3001;

global.appDebug = false;

global.appSingerDebug = false;

global.appName = 'Popil Tunes';

global.appFavUrl = '/assets/img/fav.png';

global.appLogoUrl = '/assets/img/logo.png';

global.companyName = 'Popil Tunes';

global.companyUrl = 'https://www.popilhymns.com/';

global.copyrightYear = '2021';

global.jwtSecretKey = 'asafdadfa1231asdfaakf123124o1i24bcd';

//production
// global.google_site_key = '6Lf6uvkhAAAAAJaP9UZbJJTR7NRFBLeTm7XbRg58';

// //development
global.google_site_key = '6Lcseg4mAAAAAGVmP0yCAL2A9W-y8_0b74tthZ1Z';


global.twilioSID = 'ACf24aef68e18c1e5c5d777dab213ae5f3';
global.twilioToken = '474b06ff1c8b390646afaedf983a02e1';
global.twilioNumber = '+18643871012';

global.moduleRoles = {
    0: 'admin',
    3: 'singerAdmin'
}

global.mailAuth = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    // requireTLS: true,
    service: 'gmail',
    auth: {
        user: 'cqlsystesting19@gmail.com',
        pass: 'system1234@'
    }
};

module.exports = global;