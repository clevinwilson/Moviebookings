const { Db, ObjectId } = require("mongodb")
var collection = require('../config/collection')
const db = require('../config/connection')
const bcrypt = require('bcrypt')
const { response } = require("express")
var objectId = require('mongodb').ObjectID
var nodemailer = require('nodemailer');
var generator = require('generate-password');
module.exports={
    doLogin:(loginDetails)=>{
        let loginStatus = true
        let response = {}
        return new Promise(async(resolve,reject)=>{
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ username: loginDetails.username })
            if (admin) {
                bcrypt.compare(loginDetails.password, admin.password).then((status) => {
                    if (status) {
                        console.log("admin logedin");
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("Error");
                        resolve({ status: false })
                    }
                })
            }else{
                console.log("admin not exist");
                resolve({status:false})
            }
        })
    },
    changePassword:(details,adminId)=>{
        return new Promise(async(resolve,reject)=>{
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({_id:objectId(adminId)})
            if(admin){
                let oldPassword =await bcrypt.compare(details.oldpassword, admin.password)
                if(oldPassword){
                    details.confirmpassword = await bcrypt.hash(details.confirmpassword, 10)
                    db.get().collection(collection.ADMIN_COLLECTION)
                    .updateOne({_id:ObjectId(adminId)},{
                        $set:{
                            password:details.confirmpassword
                        }
                    }).then((response)=>{
                        resolve({status:true})
                    })
                }else{
                    resolve({status:false,"message":"Incorrect old password. please retry"})
                }
            }else{
                resolve({status:false,"message":"Something Went Wrong"})
            }
        })
    },
    changeUsername:(details,adminId)=>{
        return new Promise(async(resolve,reject)=>{
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({_id:objectId(adminId)})
            if(admin){
                let oldPassword =await bcrypt.compare(details.oldpassword, admin.password)
                if(oldPassword){
                    db.get().collection(collection.ADMIN_COLLECTION)
                    .updateOne({_id:ObjectId(adminId)},{
                        $set:{
                            username:details.newusername
                        }
                    }).then((response)=>{
                        resolve({status:true})
                    })
                }else{
                    resolve({status:false,"message":"Incorrect old password. please retry"})
                }
            }else{
                resolve({status:false,"message":"Something Went Wrong"})
            }
        })
    },
    addOwner:(ownerDetails)=>{
        return new Promise(async(resolve,reject)=>{
            var password = generator.generate({
                length: 10,
                numbers: true
            });
            ownerDetails.createDate=new Date()
            ownerDetails.password=await bcrypt.hash(password, 10)
            ownerDetails.longitude=""
            ownerDetails.latitude=""
            db.get().collection(collection.OWNER_COLLECTION).insertOne(ownerDetails).then((details)=>{
                if (details) {
                    var transporter = nodemailer.createTransport({
                      host: "smtp.gmail.com",
                      port: 587,
                      secure: false,
                      requireTLS: true,
                      auth: {
                        user: "www.myappsa2z@gmail.com",
                        pass: "fmejzqxsrtfogxzg",
                      },
                    });
              
                    var mailOptions = {
                      from: "www.myappsa2z@gmail.com",
                      to: details.ops[0].email,
                      subject: "Movie booking theater account details",
                      html:`<!DOCTYPE html >

                      <head>
                          <meta charset="UTF-8">
                          <meta content="width=device-width, initial-scale=1" name="viewport">
                          <meta name="x-apple-disable-message-reformatting">
                          <meta http-equiv="X-UA-Compatible" content="IE=edge">
                          <meta content="telephone=no" name="format-detection">
                          <title></title>
                      </head>
                      
                      <body>
                          <div class="es-wrapper-color">
                              <table  class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" background="https://tlr.stripocdn.email/content/guids/CABINET_6ebdc9f620b6c98ec92e579217982603/images/88181525777203834.jpg" style="background-position: center top;">
                                  <tbody>
                                      <tr>
                                          <td class="esd-email-paddings" valign="top">
                                              <table  class="es-content esd-header-popover" cellspacing="0" cellpadding="0" align="center">
                                                  <tbody>
                                                      <tr></tr>
                                                      <tr>
                                                          <td class="es-adaptive esd-stripe" esd-custom-block-id="9083" align="center">
                                                              <table  class="es-content-body" style="background-color: transparent;" width="600" cellspacing="0" cellpadding="0" align="center">
                                                                  <tbody>
                                                                      <tr>
                                                                          <td class="esd-structure es-p10" align="left">
                                                                              <table width="100%" cellspacing="0" cellpadding="0">
                                                                                  <tbody>
                                                                                      <tr>
                                                                                          <td class="esd-container-frame" width="580" valign="top" align="center">
                                                                                              <table width="100%" cellspacing="0" cellpadding="0">
                                                                                                  <tbody>
                                                                                                      <tr>
                                                                                                          <td class="es-infoblock esd-block-text es-m-txt-c" align="left">
                                                                                                              
                                                                                                          </td>
                                                                                                      </tr>
                                                                                                  </tbody>
                                                                                              </table>
                                                                                          </td>
                                                                                      </tr>
                                                                                  </tbody>
                                                                              </table>
                                                                          </td>
                                                                      </tr>
                                                                  </tbody>
                                                              </table>
                                                          </td>
                                                      </tr>
                                                  </tbody>
                                              </table>
                                              <table class="es-header" cellspacing="0" cellpadding="0" align="center">
                                                  <tbody>
                                                      <tr>
                                                          <td class="esd-stripe" align="center">
                                                              <table class="es-header-body" style="background-color: transparent;" width="600" cellspacing="0" cellpadding="0" align="center">
                                                                  <tbody>
                                                                      <tr>
                                                                          <td class="esd-structure es-p20t es-p40b es-p20r es-p20l" style="background-repeat: no-repeat;" align="left">
                                                                              <table width="100%" cellspacing="0" cellpadding="0">
                                                                                  <tbody>
                                                                                      <tr>
                                                                                          <td class="esd-container-frame" width="560" valign="top" align="center">
                                                                                              <table width="100%" cellspacing="0" cellpadding="0">
                                                                                                  <tbody>
                                                                                                      <tr>
                                                                                                          
                                                                                                      </tr>
                                                                                                      <tr>
                                                                                                          <td class="esd-block-text es-p30t es-p5b" align="center">
                                                                                                              <h2 style="color: #ffffff; font-size: 57px; font-family: georgia, times, 'times new roman', serif; line-height: 100%;">Welcome<br></h2>
                                                                                                          </td>
                                                                                                      </tr>
                                                                                                      <tr>
                                                                                                          <td class="esd-block-image" align="center" style="font-size:0"><a target="_blank"><img src="https://tlr.stripocdn.email/content/guids/CABINET_6ebdc9f620b6c98ec92e579217982603/images/43981525778959712.png" alt="to" style="display: block;" title="to" width="42"></a></td>
                                                                                                      </tr>
                                                                                                      <tr>
                                                                                                          <td class="esd-block-text es-p15b" align="center">
                                                                                                              <h1 style="color: #ffffff; font-size: 69px; font-family: georgia, times, 'times new roman', serif; line-height: 100%;">Movie booking</h1>
                                                                                                          </td>
                                                                                                      </tr>
                                                                                                     
                                                                                                  </tbody>
                                                                                              </table>
                                                                                          </td>
                                                                                      </tr>
                                                                                  </tbody>
                                                                              </table>
                                                                          </td>
                                                                      </tr>
                                                                  </tbody>
                                                              </table>
                                                          </td>
                                                      </tr>
                                                  </tbody>
                                              </table>
                                              <table  class="p-3 es-content" cellspacing="0" cellpadding="0" align="center">
                                                  <tbody>
                                                      <tr>
                                                          <td class="esd-stripe" align="center">
                                                              <table style="padding: 20px;" class="es-content-body" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center">
                                                                  <tbody>
                                                                      <tr>
                                                                          <td class="esd-structure es-p30t es-p40r es-p40l" style="background-repeat: no-repeat;" align="left">
                                                                              <table width="100%" cellspacing="0" cellpadding="0">
                                                                                  <tbody>
                                                                                      <tr>
                                                                                          <td class="esd-container-frame" width="520" valign="top" align="center">
                                                                                              <table width="100%" cellspacing="0" cellpadding="0">
                                                                                                  <tbody>
                                                                                                      <tr>
                                                                                                          <td class= esd-block-text es-m-txt-l" align="left">
                                                                                                              <h2 style="padding:12px; font-size: 28px;">We’re very happy you’re here.</h2>
                                                                                                          </td>
                                                                                                      </tr>
                                                                                                      <tr>
                                                                                                          <td class="esd-block-image es-m-txt-l" align="left" style="font-size:0"><a target="_blank" href="https://esputnik.com/viewInBrowser"><img src="https://tlr.stripocdn.email/content/guids/CABINET_6ebdc9f620b6c98ec92e579217982603/images/99301524564595313.png" alt style="display: block;" width="75"></a></td>
                                                                                                      </tr>
                                                                                                      <tr>
                                                                                                          <td style="padding:12px;" class="esd-block-text es-p15t" align="left">
                                                                                                              <p style="    font-size: 16px; font-family: arial, 'helvetica neue', helvetica, sans-serif;line-height: 150%; color: gray;"><span  class="product-description">Dear Mr/Ms ${details.ops[0].username} We are happy to welcome you to our Movie booking company.You can log into your account using following details</span></p>
                                                                                                          </td>
                                                                                                      </tr>
                                                                                                      <tr>
                                                                                                          <td style="padding:12px;" class="esd-block-text es-p25t es-p10b" align="left">
                                                                                                              <p>User name: ${details.ops[0].username}</p>
                                                                                                              <p >Password: <input type="text" value="${password}" id="password" readonly> </p>
                                                                                                              
                                                                                                          </td>
                                                                                                      </tr>
                                                                                                      <tr>
                                                                                                          <td style="padding:12px;" class="esd-block-text es-p15t" align="left">
                                                                                                              <p><span class="product-description" style="color: red;">We recommend that  change your Password and Username after login .</span></p>
                                                                                                          </td>
                                                                                                      </tr>
                                                                                                  </tbody>
                                                                                              </table>
                                                                                          </td>
                                                                                      </tr>
                                                                                  </tbody>
                                                                              </table>
                                                                          </td>
                                                                      </tr>
                                                                      <tr>
                                                                          <td class="esd-structure es-p20t es-p40b es-p40r es-p40l" align="left">
                                                                              <table  width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 39px;margin-left: 8px;">
                                                                                  <tbody>
                                                                                      <tr>
                                                                                          <td class="esd-container-frame" width="520" valign="top" align="center">
                                                                                              <table width="100%" cellspacing="0" cellpadding="0">
                                                                                                  <tbody>
                                                                                                      <tr>
                                                                                                          <td class="esd-block-button es-p5t" align="left"><span class="es-button-border"><a style="border-radius: 6px; font-family: arial, 'helvetica neue', helvetica, sans-serif; padding: 8px; background-color: #333333; text-decoration: none; color: #999999;" href="#" class="es-button" target="_blank">Getting started</a></span></td>
                                                                                                      </tr>
                                                                                                  </tbody>
                                                                                              </table>
                                                                                          </td>
                                                                                      </tr>
                                                                                  </tbody>
                                                                              </table>
                                                                          </td>
                                                                      </tr>
                                                                  </tbody>
                                                              </table>
                                                          </td>
                                                      </tr>
                                                  </tbody>
                                              </table>
                                              
                                              
                                              <table cellpadding="0" cellspacing="0" class="es-footer" align="center">
                                                  <tbody>
                                                      <tr>
                                                          <td class="esd-stripe" esd-custom-block-id="9101" align="center">
                                                              <table class="es-footer-body" width="600" cellspacing="0" cellpadding="0" align="center">
                                                                  <tbody>
                                                                      <tr>
                                                                          <td class="esd-structure es-p20t es-p10r es-p10l" align="left">
                                                                              <table width="100%" cellspacing="0" cellpadding="0">
                                                                                  <tbody>
                                                                                      <tr>
                                                                                          <td class="esd-container-frame" width="580" valign="top" align="center">
                                                                                              <table style="margin-top: 94px;" width="100%" cellspacing="0" cellpadding="0">
                                                                                                  <tbody>
                                                                                                      <tr>
                                                                                                          <td class="esd-block-social es-p10b es-m-txt-c" align="center" style="font-size:0">
                                                                                                              <table class="es-table-not-adapt es-social" cellspacing="0" cellpadding="0">
                                                                                                                  <tbody>
                                                                                                                      <tr>
                                                                                                                          <td class="es-p10r" valign="top" align="center"><a target="_blank" href><img title="Instagram" src="https://tlr.stripocdn.email/content/assets/img/social-icons/rounded-white-bordered/instagram-rounded-white-bordered.png" alt="Inst" width="32"></a></td>
                                                                                                                          <td class="es-p10r" valign="top" align="center"><a target="_blank" href><img title="Youtube" src="https://tlr.stripocdn.email/content/assets/img/social-icons/rounded-white-bordered/youtube-rounded-white-bordered.png" alt="Yt" width="32"></a></td>
                                                                                                                          <td class="es-p10r" valign="top" align="center"><a target="_blank" href><img title="Pinterest" src="https://tlr.stripocdn.email/content/assets/img/social-icons/rounded-white-bordered/pinterest-rounded-white-bordered.png" alt="P" width="32"></a></td>
                                                                                                                          <td valign="top" align="center"><a target="_blank" href><img title="Facebook" src="https://tlr.stripocdn.email/content/assets/img/social-icons/rounded-white-bordered/facebook-rounded-white-bordered.png" alt="Fb" width="32"></a></td>
                                                                                                                      </tr>
                                                                                                                  </tbody>
                                                                                                              </table>
                                                                                                          </td>
                                                                                                      </tr>
                                                                                                      <tr>
                                                                                                          <td class="esd-block-text es-p10t es-m-txt-c" align="center">
                                                                                                              <p>You're receiving this email because you asked us about regular newsletter.</p>
                                                                                                              <p>©2020 Movie booking | India,Kannur</p>
                                                                                                          </td>
                                                                                                      </tr>
                                                                                                      <tr>
                                                                                                          <td align="center" class="esd-block-text es-p20t es-m-txt-c">
                                                                                                              <p><a target="_blank" href="#">Privacy Policy</a> | <a target="_blank" href class="unsubscribe">Unsubscribe</a></p>
                                                                                                          </td>
                                                                                                      </tr>
                                                                                                  </tbody>
                                                                                              </table>
                                                                                          </td>
                                                                                      </tr>
                                                                                  </tbody>
                                                                              </table>
                                                                          </td>
                                                                      </tr>
                                                                  </tbody>
                                                              </table>
                                                          </td>
                                                      </tr>
                                                  </tbody>
                                              </table>
                                             
                                          </td>
                                      </tr>
                                  </tbody>
                              </table>
                          </div>
                      </body>
                      </html>`,
                     
                    };
              
                    transporter.sendMail(mailOptions, function (error, info) {
                      if (error) {
                        console.log(error);
                        resolve({message:"Email not send please try again "})
                      } else {
                        console.log("Email sent: " + info.response);
                        resolve({status:true})
                      }
                    });
                } else {
                    resolve({status:false})
                }
            })
        })
    },
    isUserExist:(userName)=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.OWNER_COLLECTION).findOne({username:userName})
            if(user){
                resolve({status:true})
            }else{
                resolve({status:false})
            }
        })
    },
    isEmailExist:(email)=>{
        return new Promise(async(resolve,reject)=>{
            let emailExist=await db.get().collection(collection.OWNER_COLLECTION).findOne({email:email})
            if(emailExist){
                resolve({status:true})
            }else{
                resolve({status:false})
            }
        })
    },
    getOwnerDetails:()=>{
        return new Promise(async(resolve,reject)=>{
            let theaterList=await db.get().collection(collection.OWNER_COLLECTION).find().toArray()
            resolve(theaterList)
        })
    },
    theaterDetails:(theaterId)=>{
        return new Promise(async(resolve,reject)=>{
            let theater=await db.get().collection(collection.OWNER_COLLECTION).findOne({_id:ObjectId(theaterId)})
            console.log(theater);
            resolve(theater)
        })
    },
    editTheate:(theaterId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.OWNER_COLLECTION).findOne({_id:objectId(theaterId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    editTheateDetails:(details)=>{
        return new Promise(async(resolve,reject)=>{
            let theater =await db.get().collection(collection.OWNER_COLLECTION).findOne({_id:ObjectId(details.id)})
            if(theater){
                db.get().collection(collection.OWNER_COLLECTION)
                  .updateOne({_id:objectId(details.id)},{
                     $set:{
                       username:details.username,
                       theatername:details.theatername,
                       phonenumber:details.phonenumber
                         }
                    }).then((response)=>{
                        resolve(response)
                })
            }else{
                console.log('error');
                resolve(theater)
            }
        })
    },
    deleteTheater:(theaterId)=>{
        return new Promise(async(resolve,reject)=>{
            let theater =await db.get().collection(collection.OWNER_COLLECTION).findOne({_id:ObjectId(theaterId)})
            if(theater){
                db.get().collection(collection.OWNER_COLLECTION).removeOne({_id:objectId(theaterId)}).then((response)=>{
                    resolve(response)
                })
            }else{
                resolve(theater)
            }
        })
    },
    getTheaterCount:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.OWNER_COLLECTION).count().then((count)=>{
                resolve(count)
            })
        })
    },
    getUserBookingDetails(){
        return new Promise(async(resolve,reject)=>{
            var date = new Date();
            var today = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            let userDetails=await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
                
               
                {
                    $lookup: {
                        from: collection.USER_COLLECTION,
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $lookup: {
                        from: collection.SCREEN_COLLECTION,
                        localField: 'screen',
                        foreignField: '_id',
                        as: 'screen'
                    }
                },
                {
                    $lookup: {
                        from: collection.OWNER_COLLECTION,
                        localField: 'theater',
                        foreignField: '_id',
                        as: 'theater'
                    }
                },
                {
                    $lookup: {
                        from: collection.SHOW_COLLECTION,
                        localField: 'showId',
                        foreignField: '_id',
                        as: 'show'
                    }
                },
                
                {
                    $project: {

                        _id: 1,seats:1,date:1,status:1,price:1,show: { $arrayElemAt: ['$show', 0]},user: { $arrayElemAt: ['$user', 0]},screen: { $arrayElemAt: ['$screen', 0] },theater: { $arrayElemAt: ['$theater', 0]}
                    }
                }


            ]).sort({_id:-1}).toArray()
            console.log(userDetails);
            resolve(userDetails)
        })
    },
    getUserDetails:()=>{
        return new Promise(async(resolve,reject)=>{
            let users =await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    deleteUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user =await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)})
            if(user){
                db.get().collection(collection.USER_COLLECTION).removeOne({_id:objectId(userId)}).then((response)=>{
                    resolve(response)
                })
            }else{
                resolve(false)
            }
        })
    }
}