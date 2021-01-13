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
    res.render('owner/login', { "ownerLoginError": req.session.ownerLoginError, "forgotPasswordSucc": req.session.forgotPasswordSucc, "forgotPassword": req.session.forgotPassword })
    req.session.ownerLoginError = false
    req.session.forgotPasswordSucc = false
    req.session.forgotPassword = false


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
        res.render('owner/screen', { screens, owner, "editScreenSucc": req.session.editScreenSucc, "editScreenEr": req.session.editScreenEr, "addShowSucc": req.session.addShowSucc, "addShowErr": req.session.addShowErr })
        req.session.editScreenSucc = false
        req.session.editScreenEr = false
        req.session.addShowSucc = false
        req.session.addShowErr = false
    })
})
router.get('/add-screen', verifyLogin, (req, res) => {
    owner = req.session.owner
    res.render('owner/add-screen', { owner, "addScreenSucc": req.session.addScreenSucc, "addScreenErr": req.session.addScreenErr })
    req.session.addScreenSucc = false
    req.session.addScreenErr = false
})

router.post('/add-screen', verifyLogin, (req, res) => {
    let owner = req.session.owner._id
    ownerHelper.addScreen(req.body, owner).then((response) => {
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
    let owner = req.session.owner
    ownerHelper.getShedule(req.params.id).then((show) => {
        console.log(show);
        res.render('owner/view-schedule', { screenId: req.params.id, show, owner })
    })
})

//show routers
router.get('/add-show/:id', verifyLogin, (req, res) => {
    let owner = req.session.owner
    ownerHelper.getMoviesTitle().then((movies) => {
        res.render('owner/add-show', { screenId: req.params.id, movies, owner })

    })

})

router.post('/add-show', verifyLogin, (req, res) => {
    ownerHelper.addShow(req.body, req.session.owner._id).then((response) => {
        if (response.status) {
            req.session.addShowSucc = "Show added successfully"
            res.redirect('/owner/screen')
        } else {
            req.session.addShowErr = "Error"
            res.redirect('/owner/screen')
        }
    })
})
router.get('/edit-show/:id', verifyLogin, (req, res) => {
    ownerHelper.getShowDetails(req.params.id).then(async (showDetails) => {
        console.log(showDetails);
        let movieList = await ownerHelper.getMoviesTitle(req.session.owner._id)
        res.render('owner/edit-show', { showDetails, movieList })
    })
})

router.post('/edit-show/:id', verifyLogin, (req, res) => {
    ownerHelper.updateShow(req.body, req.params.id).then((response) => {
        if (response.status) {
            req.session.editShowSucc = "show updated Successfully"
            res.redirect('/owner/screen')
        } else {
            req.session.editShowErr = "Error"
            res.redirect('/owner/screen')
        }
    })
})

router.get('/delete-show/:id', verifyLogin, (req, res) => {
    ownerHelper.deleteShow(req.params.id).then((response) => {
        if (response) {
            res.json({ status: true })
        } else {
            res.json({ status: false })
        }
    })
})

// owner movie management
router.get('/movie-management', verifyLogin, async (req, res) => {
    let owner = req.session.owner
    let UpComingMoviesList =await ownerHelper.UpComingMoviesList(req.session.owner._id)
    ownerHelper.getMovies(req.session.owner._id).then((movies) => {
        res.render('owner/movie-management', {UpComingMoviesList, owner, movies, "editMovieSucc": req.session.editMovieSucc, "editMovieErr": req.session.editMovieErr })
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
    ownerHelper.addMovie(req.body, req.session.owner._id).then((id) => {
        let image = req.files.Image
        let banner = req.files.Image2
        image.mv('./public/movie-images/' + id + '.jpg', (err, done) => {
            banner.mv('./public/movie-banner/' + id + '.jpg', (err) => {
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
})



router.get('/edit-movie/:id', verifyLogin, (req, res) => {
    ownerHelper.getMovieDetails(req.params.id).then((movieDetails) => {
        console.log(movieDetails);
        res.render('owner/edit-movie', { movieDetails })
    })
})

router.post('/edit-movie/:id', verifyLogin, (req, res) => {
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

router.get('/delete-movie/:id', verifyLogin, (req, res) => {
    ownerHelper.deleteMovie(req.params.id).then((response) => {
        if (response.status) {
            res.json({ status: true })
        } else {
            res.json({ status: false })
        }
    })
})

//upcoming movies
router.get('/upcoming-movies', verifyLogin, (req, res) => {
    let owner =req.session.owner
    res.render('owner/upcoming-movies', { owner,"upMovies": req.session.upMovies, "upmoviesErr": req.session.upmoviesErr })
    req.session.upMovies = false
    req.session.upmoviesErr = false
})

router.post('/upcoming-movies',verifyLogin,(req, res) => {
    ownerHelper.addUpcomingMovies(req.body, req.session.owner._id).then((id) => {
        console.log(id);
        let image = req.files.Image
        image.mv('./public/upcoming-movies/' + id + '.jpg', (err, done) => {
            if (!err) {
                req.session.upMovies = "Movie added Successfully"
                res.redirect('/owner/upcoming-movies')
            } else {
                req.session.upmoviesErr = "Something went wrong try again"
                res.redirect('/owner/upcomint-movies')
            }
        })
       
    })
})

router.get('/delete-UpComingMovies/:id',(req,res)=>{
    ownerHelper.deleteUpcomingMovies(req.params.id).then((response)=>{
        if(response.status){
            res.json({ status: true })
        }else{
            res.json({ status: false})
        }
    })
})

//Owner Users acrivity

router.get('/users-activity', (req, res) => {
    ownerHelper.getUserDetails(req.session.owner._id).then((details)=>{
        res.render('owner/users-activity',{details,owner:req.session.owner})
    })
    
})

//owenr settings page
router.get('/settings', verifyLogin, (req, res) => {
    let owner = req.session.owner
    ownerHelper.getLocation(req.session.owner._id).then((ownerdetails)=>{
        console.log(ownerdetails);
        res.render('owner/settings', { owner,ownerdetails })
    })
})
//Owner change password
router.get('/change-password', verifyLogin, (req, res) => {
    let owner = req.session.owner
    res.render('owner/change-password', { owner, "changePasswordSucc": req.session.changePasswordSucc, "changePasswordError": req.session.changePasswordError })
    req.session.changePasswordSucc = false
    req.session.changePasswordError = false
})

router.post('/changePassword', verifyLogin, (req, res) => {
    ownerHelper.changePassword(req.body, req.session.owner._id).then((response) => {
        if (response.status) {
            req.session.changePasswordSucc = "Password Updated Successfully"
            res.redirect('/owner/change-password')
        } else {
            req.session.changePasswordError = response.message
            res.redirect('/owner/change-password')
        }
    })
})
//owner change username
router.get('/change-username', verifyLogin, (req, res) => {
    let owner = req.session.owner
    res.render('owner/change-username', { owner, "changeUsernameSucc": req.session.changeUsernameSucc, "changeUsernameError": req.session.changeUsernameError })
    req.session.changeUsernameSucc = false
    req.session.changeUsernameError = false
})
router.post('/changeusername', verifyLogin, (req, res) => {
    ownerHelper.changeUsername(req.body, req.session.owner._id).then((response) => {
        if (response.status) {
            req.session.changeUsernameSucc = "User name Updated Successfully"
            res.redirect('/owner/change-username')
        } else {
            req.session.changeUsernameError = response.message
            res.redirect('/owner/change-username')
        }
    })
})

//owner profile
router.get('/profile', verifyLogin, (req, res) => {
    let owner = req.session.owner
    ownerHelper.getProfile(req.session.owner._id).then((profile) => {
        res.render('owner/profile', { owner, profile, "editProfileSucc": req.session.editProfileSucc, "editProfileErr": req.session.editProfileErr })
        req.session.editProfileSucc = false
        req.session.editProfileErr = false
    })
})
router.get('/edit-profile', verifyLogin, (req, res) => {
    let owner = req.session.owner
    ownerHelper.getOwnerDetails(req.session.owner._id).then((response) => {
        res.render('owner/edit-profile', { response, owner })
    })
})
router.post('/profile/:id', verifyLogin, (req, res) => {
    ownerHelper.editProfile(req.body, req.params.id).then((response) => {
        if (response.status) {
            req.session.editProfileSucc = "Profile updated successfully"
            res.redirect('/owner/profile')
        } else {
            req.session.editProfileErr = "Something went wrong try again"
            res.redirect('/owner/profile')
        }
    })
})

//edit photo 
router.get('/edit-photo', verifyLogin, (req, res) => {
    let ownerId = req.session.owner._id
    let owner = req.session.owner
    res.render('owner/edit-photo', { ownerId, "OwnerImagesucc": req.session.OwnerImagesucc, "OwnerImgerror": req.session.OwnerImgerror, owner })
    req.session.OwnerImagesucc = false
    req.session.OwnerImgerror = false
})
router.post('/changePhoto/:id', verifyLogin, (req, res) => {
    if (req.files.Image) {
        let image = req.files.Image
        image.mv('./public/owner-photo/' + req.params.id + '.jpg', (err) => {
            if (!err) {
                req.session.OwnerImagesucc = "Photo Updated successfully"
                res.redirect('/owner/edit-photo')
            } else {
                req.session.OwnerImgerror = "Something went wrong try again"
                res.redirect('/owner/edit-photo')
            }
        })

    }
    
})
//Owner forgot password
router.get('/forgot-password', (req, res) => {
    res.render('owner/forgot-password', { "forgotPasswordSucc": req.session.forgotPasswordSucc, "verifyCodeErr": req.session.verifyCodeErr })
    req.session.forgotPasswordSucc = false
    req.session.verifyCodeErr = false
})

router.post('/forgot-password', (req, res) => {
    ownerHelper.forgotPassword(req.body).then((response) => {
        if (response.status) {
            req.session.resetPassword = true
            if (req.session.resetPassword) {
                res.render('owner/verify-code', { "ownerId": response.ownerId })
                req.session.resetPassword = false
            } else {
                res.redirect("/owner");
            }
        } else {
            req.session.forgotPasswordSucc = response.message
            res.redirect('/owner/forgot-password')
        }
    })
})

router.post('/submit-code/:id', (req, res) => {
    ownerHelper.checkCode(req.body, req.params.id).then((response) => {
        if (response.status) {
            req.session.resetPassword = true
            if (req.session.resetPassword) {
                res.render('owner/new-password', { ownerId: response.ownerId })
                req.session.resetPassword = false
            } else {
                res.redirect("/owner");
            }
        } else {
            req.session.verifyCodeErr = "The verification code is not correct"
            res.redirect('/owner/forgot-password')
        }
    })
})

router.post('/password-submit/:id', (req, res) => {
    ownerHelper.updatePassword(req.body, req.params.id).then((response) => {
        if (response) {
            res.render('owner/forgot-password-response')
        } else {
            req.session.forgotPassword = "Something went wrong try again"
            res.redirect('/owner')
        }
    })
})

//seating layout for owner

router.get('/seats/:id,:showid',(req,res)=>{
    ownerHelper.getScreenDetails(req.params.id,req.params.showid).then((response)=>{
        console.log(response,"fdsfs");
        if(response){
            res.render('owner/seat-layout',{"screenId":req.params.id,"showId":req.params.showid,"response":response.screenDetails,"showDetails":response.showDetails})
        }else{
            res.redirect('/owner/view-shedule')
        }
    })
})

router.post('/add-seats/:id,:showId',(req,res)=>{
    console.log(req.params.id);
    ownerHelper.addSeats(req.params.id,req.params.showId,req.body).then((response)=>{
        if(response){
            res.redirect('/owner/dashboard')
        }
    })
})

// location
router.get('/map',(req,res)=>{
    res.render('owner/map')
})

router.post('/location',(req,res)=>{

    ownerHelper.updateLocation(req.body,req.session.owner._id).then((response)=>{
        res.json({status:true})
        
    })
})

router.get('/movie-avilability/:movietitle',(req,res)=>{
    ownerHelper.checkMovie(req.params.movietitle).then((response)=>{
       
        if(response.status){
           
            res.json({status:true})
        }else{
            res.json({status:false})
        }
    })
})

module.exports = router;