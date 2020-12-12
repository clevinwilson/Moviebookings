const { response } = require("express");
var express = require("express");
var router = express.Router();
var ownerHelper = require('../helpers/owner-helpers')

const verifyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect("/owner");
    }
};

router.get('/', (req, res) => {
    res.render('owner/login', { "ownerLoginError": req.session.ownerLoginError })
    req.session.ownerLoginError = false
})
router.get('/dashboard', verifyLogin, (req, res) => {
    owner = req.session.owner
    res.render('owner/dashboard', { owner })
})
//login 
router.post('/login', (req, res) => {
    ownerHelper.doLogin(req.body).then((response) => {
        if (response.status) {
            req.session.owner = response.owner;
            req.session.loggedIn = true;
            console.log(req.session.owner);
            res.redirect("/owner/dashboard");
        } else {
            req.session.ownerLoginError = "Incorrect username or password ";
            res.redirect("/owner");
        }
    })
})

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

//owner screen
router.get('/screen', verifyLogin, (req, res) => {
    owner = req.session.owner
    ownerHelper.getAllScreens(req.session.owner._id).then((screens) => {
        res.render('owner/screen', { screens, owner, "editScreenSucc": req.session.editScreenSucc, "editScreenEr": req.session.editScreenEr })
        req.session.editScreenSucc = false
        req.session.editScreenEr = false
    })
})
router.get('/add-screen', verifyLogin, (req, res) => {
    owner = req.session.owner
    res.render('owner/add-screen', { owner, "addScreenSucc": req.session.addScreenSucc, "addScreenErr": req.session.addScreenErr })
    req.session.addScreenSucc = false
    req.session.addScreenErr = false
})

router.post('/add-screen', verifyLogin, (req, res) => {
    let owner=req.session.owner._id
    ownerHelper.addScreen(req.body,owner).then((response) => {
        if (response) {
            req.session.addScreenSucc = "Screen added Successfully"
            res.redirect('/owner/add-screen')
        } else {
            req.session.addScreenErr = "Something went wrong try again"
            res.redirect('/owner/add-screen')
        }
    })
})


router.get('/edit-screen/:id', verifyLogin, (req, res) => {
    let owner = req.session.owner
    ownerHelper.getScreen(req.params.id).then((screen) => {
        res.render('owner/edit-screen', { owner, screen })
    })
})

router.post('/edit-screen/:id', verifyLogin, (req, res) => {
    ownerHelper.editScreen(req.body, req.params.id).then((response) => {
        if (response.status) {
            req.session.editScreenSucc = "Screen edited Successfully "
            res.redirect('/owner/screen')
        } else {
            req.session.editScreenErr = "Something went wrong try again"
            res.redirect('/owner/screen')
        }
    })
})

router.get('/delete-screen/:id', verifyLogin, (req, res) => {
    console.log(req.params.id);
    ownerHelper.deleteScreen(req.params.id).then((response) => {
        if (response.status) {
            res.json({ status: true })
        } else {
            res.json({ status: false })
        }
    })
})

router.get('/view-schedule/:id', verifyLogin, (req, res) => {
    res.render('owner/view-schedule')
})

//show routers
router.get('/add-show', verifyLogin, (req, res) => {
    res.render('owner/add-show')
})

router.get('/edit-show', verifyLogin, (req, res) => {
    res.render('owner/edit-show')
})

// owner movie management
router.get('/movie-management', verifyLogin, (req, res) => {
    let owner = req.session.owner
    ownerHelper.getMovies().then((movies) => {
        res.render('owner/movie-management', { owner, movies, "editMovieSucc": req.session.editMovieSucc, "editMovieErr": req.session.editMovieErr })
        req.session.editMovieSucc = false
        req.session.editMovieErr = false
    })
})

router.get('/add-movie', verifyLogin, (req, res) => {
    let owner = req.session.owner
    res.render('owner/add-movie', { owner, "addMovieSucc": req.session.addMovieSucc, "addMovieErr": req.session.addMovieErr, })
    req.session.addMovieSucc = false
    req.session.addMovieErr = false
})

router.post('/add-movie', verifyLogin, (req, res) => {
    ownerHelper.addMovie(req.body).then((id) => {
        let image = req.files.Image
        image.mv('./public/movie-images/' + id + '.jpg', (err, done) => {
            if (!err) {
                req.session.addMovieSucc = "Movie added Successfully"
                res.redirect('/owner/add-movie')
            } else {
                req.session.addMovieErr = "Something went wrong try again"
                res.redirect('/owner/add-movie')
            }
        })
    })
})

router.get('/upcoming-movies', verifyLogin, (req, res) => {
    res.render('owner/upcoming-movies')
})

router.get('/edit-movie/:id', verifyLogin, (req, res) => {
    ownerHelper.getMovieDetails(req.params.id).then((movieDetails) => {
        console.log(movieDetails);
        res.render('owner/edit-movie', { movieDetails })
    })
})

router.post('/edit-movie/:id',verifyLogin,(req, res) => {
    ownerHelper.editMovie(req.body, req.params.id).then((response) => {
        if (req.files.Image) {
            let image = req.files.Image
            image.mv('./public/movie-images/' + req.params.id + '.jpg', (err) => {
                if (!err) {
                    if (response.status) {
                        req.session.editMovieSucc = "Movie Edited Successfully"
                        res.redirect('/owner/movie-management')
                    } else {
                        req.session.editMovieErr = "Something went wrong try again"
                        res.redirect('/owner/movie-management')
                    }
                } else {
                    req.session.editMovieErr = "Something went wrong try again"
                    res.redirect('/owner/movie-management')
                }
            })

        }

    })
})

router.get('/delete-movie/:id',verifyLogin,(req,res)=>{
    ownerHelper.deleteMovie(req.params.id).then((response)=>{
        if(response.status){
            res.json({status:true})
        }else{
            res.json({status:false})
        }
    })
})

//Owner Users acrivity

router.get('/users-activity', (req, res) => {
    res.render('owner/users-activity')
})

//owenr settings page
router.get('/settings',verifyLogin,(req,res)=>{
    let owner=req.session.owner
    res.render('owner/settings',{owner})
})
module.exports = router;