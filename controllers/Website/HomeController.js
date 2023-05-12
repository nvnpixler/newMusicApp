module.exports = {
    home: function async(req, res) {
        try{
            res.render('website/home/index',{
                message:'',
                title : 'home'
            });
        } catch (err) {
            console.log(err,'-------errorr-----------');
            return helper.error(res, err);
        }
    },
    
    about: function async(req, res) {
        try{
            res.render('website/about',{
                message:'',
                title : 'about',
            });
        } catch (err) {
            console.log(err,'-------errorr-----------');
            return helper.error(res, err);
        }
    },
    
    terms: function async(req, res) {
        try{
            res.render('website/terms',{
                message:'',
                title : 'terms'
            });
        } catch (err) {
            console.log(err,'-------errorr-----------');
            return helper.error(res, err);
        }
    },
    
    privacy: function async(req, res) {
        try{
            res.render('website/privacy',{
                message:'',
                title : 'privacy'
            });
        } catch (err) {
            console.log(err,'-------errorr-----------');
            return helper.error(res, err);
        }
    },
    
    contact_us: function async(req, res) {
        try{
            res.render('website/contact_us_index',{
                message:'',
                title : 'contact_us'
            });
        } catch (err) {
            console.log(err,'-------errorr-----------');
            return helper.error(res, err);
        }
    },
}