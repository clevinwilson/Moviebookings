const { response } = require("express");
var express = require("express");
var router = express.Router();
var adminHelpers = require("../helpers/admin-helpers");
var nodemailer = require("nodemailer");

/* GET home page. */
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/admin");
  }
};
router.get("/", function (req, res, next) {
  res.render("admin/login", { adminLoginError: req.session.adminLoginError });
  req.session.adminLoginError = false;
});

//dashboard 
router.get("/dashboard", verifyLogin, (req, res) => {
  let admin = req.session.admin;
  adminHelpers.getTheaterCount().then((theaterCount)=>{
    res.render("admin/dashboard", { admin,theaterCount });
  })
});


//manage theater
router.get("/theater-manage", verifyLogin, (req, res) => {
  let admin = req.session.admin;
  adminHelpers.getOwnerDetails().then((details)=>{
    res.render("admin/theater-manage", { admin,details,"editTheateSucc":req.session.editTheateSucc,"editTheateError":req.session.editTheateError });
    req.session.editTheateSucc=false;
    req.session.editTheateError=false;
  })
});

router.get("/theater-details/:id", verifyLogin, (req, res) => {
  let admin = req.session.admin;
  adminHelpers.theaterDetails(req.params.id).then((details)=>{
    res.render("admin/theater-details", { admin,details });
  })
});

router.get('/delete-theater/:id',(req,res)=>{
  adminHelpers.deleteTheater(req.params.id).then((response)=>{
    if(response){
      res.json({status:true})
    }else{
      res.json({status:false})
    }
  })
})

//edit theater
router.get("/edit-theater/:id", verifyLogin, (req, res) => {
  let admin = req.session.admin;
  adminHelpers.editTheate(req.params.id).then((response)=>{
    res.render("admin/edit-theater", { response,admin  });
  })

});

router.post('/edit-theater-details',(req,res)=>{
  adminHelpers.editTheateDetails(req.body).then((response)=>{
    if(response){
      req.session.editTheateSucc = "Edited successfully";
      res.redirect('/admin/theater-manage')
    }else{
      req.session.editTheateError="Something went wrong try again"
      res.redirect('/admin/theater-manage')
    }
  })
})

//add Owner
router.get("/add-owner", verifyLogin, (req, res) => {
  let admin = req.session.admin;
  res.render("admin/add-owner", {admin,createOwnersuccess: req.session.createOwnersuccess, createOwnerError: req.session.createOwnerError});
  req.session.createOwnersuccess = false;
  req.session.createOwnerError=false;
  
});

router.post("/add-owner", (req, res) => {
  adminHelpers.addOwner(req.body).then((response) => {
    console.log(response);
    if (response.status) {
        req.session.createOwnersuccess = "Theater Owner added successfully";
        res.redirect("/admin/add-owner");
    } else {
      if(response.message){
        req.session.createOwnerError = response.message;
        res.redirect("/admin/add-owner");
      }else{
        req.session.createOwnerError="Error"
      }
    }
  });
});

router.get("/user-management", verifyLogin, (req, res) => {
  let admin = req.session.admin;
  res.render("admin/users-management", { admin });
});

router.get("/users-activity", verifyLogin, (req, res) => {
  let admin = req.session.admin;
  res.render("admin/users-activity", { admin });
});

router.post("/login", (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin;
      req.session.loggedIn = true;
      console.log(req.session.admin);
      res.redirect("/admin/dashboard");
    } else {
      req.session.adminLoginError = "Incorrect username or password ";
      res.redirect("/admin");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.get("/settings", verifyLogin, (req, res) => {
  res.render("admin/settings", { admin: req.session.admin });
});

// admin change passwor router
router.get("/change-password", verifyLogin, (req, res) => {
  let admin = req.session.admin;
  res.render("admin/change-password", {
    admin,passwordmessage: req.session.passwordmessage,
  });
  req.session.passwordmessage = false;
});

//change password
router.post("/changePassword", verifyLogin, (req, res) => {
  let admin = req.session.admin._id;
  adminHelpers.changePassword(req.body, admin).then((response) => {
    if (response.status) {
      req.session.passwordmessage = {
        message: "Password Updated Successfully",
        color: "green",
      };
      res.redirect("/admin/change-password");
    } else {
      req.session.passwordmessage = {
        message: response.message,
        color: "red",
      };
      res.redirect("/admin/change-password");
    }
  });
});

//change username
router.get("/change-username", verifyLogin, (req, res) => {
  let admin = req.session.admin;
  res.render("admin/change-username", {
    admin,
    usernamemessage: req.session.usernamemessage,
  });
  req.session.usernamemessage = false;
});

router.post("/changeusername", verifyLogin, (req, res) => {
  let admin = req.session.admin;
  adminHelpers.changeUsername(req.body, req.session.admin._id).then((response) => {
      if (response.status) {
        req.session.usernamemessage = {
          message: "User Name Updated Successfully",
          color: "green",
        };
        res.redirect("/admin/change-username");
      } else {
        req.session.usernamemessage = {
          message: response.message,
          color: "red",
        };
        res.redirect("/admin/change-username");
      }
    });
});

// theater user name checking
router.get('/isuserexist/:user',verifyLogin,(req,res)=>{
  adminHelpers.isUserExist(req.params.user).then((response)=>{
    res.json(response.status)
  })
})

//Admin profile
router.get('/profile',verifyLogin,(req,res)=>{
  let admin = req.session.admin;
  res.render('admin/profile',{admin,"imagesucc":req.session.imagesucc,"imgerror":req.session.imgerror})
  req.session.imagesucc=false
  req.session.imgerror=false
})

router.post('/profile/:id',verifyLogin,(req,res)=>{
  if(req.files.Image){
    let image=req.files.Image
    image.mv('./public/admin-photo/' + req.params.id + '.jpg',(err)=>{
      if(!err){
        req.session.imagesucc="Photo Updated successfully"
        res.redirect('/admin/profile')
      }else{
        req.session.imgerror="Something went wrong try again"
        res.redirect('/admin/profile')
      }
    })
    
  }
})

//check email availability
router.get('/isemailexist/:email',verifyLogin,(req,res)=>{
  console.log(req.params.email);
  adminHelpers.isEmailExist(req.params.email).then((response)=>{
    res.json(response.status)
  })
})

module.exports = router;
