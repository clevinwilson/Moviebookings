const { Db, ObjectId } = require("mongodb")
var collection = require('../config/collection')
const db = require('../config/connection')
const bcrypt = require('bcrypt')
const { response } = require("express")
var objectId = require('mongodb').ObjectID
var nodemailer = require('nodemailer');
var generator = require('generate-password');
const { template } = require("handlebars")
const { UPCOMINGMOVIES_COLLECTION } = require("../config/collection")

module.exports = {
    doLogin: (details) => {
        let loginStatus = true
        let response = {}
        return new Promise(async (resolve, reject) => {
            let owner = await db.get().collection(collection.OWNER_COLLECTION).findOne({ username: details.username })
            if (owner) {
                bcrypt.compare(details.password, owner.password).then((status) => {
                    if (status) {
                        console.log("Owner logedin");
                        response.owner = owner
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("Error");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("Owner not exist");
                resolve({ status: false })
            }
        })
    },
    addScreen: (details, ownerId) => {
        
        let seatno =((details.viprow*details.vipcol)+(details.premiumrow*details.premiumcol)+(details.executiverow*details.executivecol)+(details.normalrow*details.normalcol))
        let rows=(parseInt((details.viprow))+parseInt((details.premiumrow))+parseInt((details.executiverow))+parseInt((details.normalrow)))
        details.seatno=seatno
        details.rows=rows
        details.owner = objectId(ownerId)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SCREEN_COLLECTION).insertOne(details).then((response) => {
                resolve(response)
            })
        })
    },
    getAllScreens: (ownerId) => {
        return new Promise(async (resolve, reject) => {
            let screens = await db.get().collection(collection.SCREEN_COLLECTION).find({ owner: objectId(ownerId) }).toArray()
            resolve(screens)
        })
    },
    getScreen: (ScreenId) => {
        return new Promise(async (resolve, reject) => {
            let screen = await db.get().collection(collection.SCREEN_COLLECTION).findOne({ _id: objectId(ScreenId) })
            resolve(screen)
        })
    },
    editScreen: (details, id) => {
        return new Promise(async (resolve, reject) => {
            let screen = await db.get().collection(collection.SCREEN_COLLECTION).findOne({ _id: objectId(id) })
            if (screen) {
                db.get().collection(collection.SCREEN_COLLECTION)
                    .updateOne({ _id: objectId(id) }, {
                        $set: {
                            screenname: details.screenname,
                            seatno: details.seatno
                        }
                    }).then((response) => {
                        if (response) {
                            resolve({ status: true })
                        } else {
                            resolve({ status: false })
                        }
                    })
            } else {
                resolve({ status: false })
            }
        })
    },
    deleteScreen: (screenId) => {
        return new Promise(async (resolve, reject) => {
            let screen = await db.get().collection(collection.SCREEN_COLLECTION).findOne({ _id: objectId(screenId) })
            if (screen) {
                db.get().collection(collection.SCREEN_COLLECTION).removeOne({ _id: objectId(screenId) }).then((response) => {
                    if (response) {
                        resolve({ status: true })
                    } else {
                        resolve({ status: false })
                    }
                })
            } else {
                resolve({ status: false })
            }
        })
    },
    addMovie: (details, ownerId) => {
        details.owner = objectId(ownerId)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.MOVIE_COLLECTION).insertOne(details).then((response) => {
                resolve(response.ops[0]._id)
            })
        })
    },
    getMovies: (ownerId) => {
        return new Promise(async (resolve, reject) => {
            let movies = await db.get().collection(collection.MOVIE_COLLECTION).find({ owner: objectId(ownerId) }).toArray()
            resolve(movies)
        })
    },
    getMovieDetails: (id) => {
        return new Promise(async (resolve, reject) => {
            let Moviedetails = await db.get().collection(collection.MOVIE_COLLECTION).findOne({ _id: objectId(id) })
            resolve(Moviedetails)
        })
    },
    editMovie: (details, movieId) => {
        return new Promise(async (resolve, reject) => {
            let movie = await db.get().collection(collection.MOVIE_COLLECTION).findOne({ _id: objectId(movieId) })
            if (movie) {
                db.get().collection(collection.MOVIE_COLLECTION)
                    .updateOne({ _id: objectId(movieId) }, {
                        $set: {
                            movietitle: details.movietitle,
                            cast: details.cast,
                            director: details.director,
                            releasedate: details.releasedate,
                            hour: details.hour,
                            minute: details.minute,
                            trailerlink: details.trailerlink,
                            language: details.language,
                            type: details.type
                        }
                    }).then((response) => {
                        if (response) {
                            resolve({ status: true })
                        } else {
                            resolve({ status: false })
                        }

                    })
            } else {
                resolve({ status: false })
            }

        })
    },
    deleteMovie: (movieId) => {
        return new Promise(async (resolve, reject) => {
            let movie = await db.get().collection(collection.MOVIE_COLLECTION).removeOne({ _id: objectId(movieId) })
            if (movie) {
                db.get().collection(collection.MOVIE_COLLECTION).removeOne({ _id: objectId(movieId) }).then((response) => {
                    if (response) {
                        resolve({ status: true })
                    } else {
                        resolve({ status: false })
                    }
                })
            } else {
                resolve({ status: true })
            }
        })
    },
    changePassword: (details, ownerId) => {
        return new Promise(async (resolve, reject) => {
            let owner = await db.get().collection(collection.OWNER_COLLECTION).findOne({ _id: objectId(ownerId) })
            if (owner) {
                let oldPassword = await bcrypt.compare(details.oldpassword, owner.password)
                if (oldPassword) {
                    details.confirmpassword = await bcrypt.hash(details.confirmpassword, 10)
                    db.get().collection(collection.OWNER_COLLECTION)
                        .updateOne({ _id: objectId(ownerId) }, {
                            $set: {
                                password: details.confirmpassword
                            }
                        }).then((response) => {
                            if (response) {
                                resolve({ status: true })
                            } else {
                                resolve({ status: false, "message": "Something Went Wrong try again" })
                            }
                        })
                } else {
                    resolve({ status: false, "message": "Incorrect old password. please retry" })
                }
            } else {
                resolve({ status: false, "message": "Owner not exist" })
            }
        })
    },
    changeUsername: (details, ownerId) => {
        return new Promise(async (resolve, reject) => {
            let owner = await db.get().collection(collection.OWNER_COLLECTION).findOne({ _id: objectId(ownerId) })
            if (owner) {
                let password = await bcrypt.compare(details.password, owner.password)
                if (password) {
                    db.get().collection(collection.OWNER_COLLECTION)
                        .updateOne({ _id: ObjectId(ownerId) }, {
                            $set: {
                                username: details.newusername
                            }
                        }).then((response) => {
                            if (response) {
                                resolve({ status: true })
                            } else {
                                resolve({ status: false, "message": "Something Went Wrong" })
                            }

                        })
                } else {
                    resolve({ status: false, "message": "Incorrect old password. please retry" })
                }
            } else {
                resolve({ status: false, "message": "User not exist" })
            }
        })
    },
    getProfile: (ownerId) => {
        return new Promise(async (resolve, reject) => {
            let owner = await db.get().collection(collection.OWNER_COLLECTION).findOne({ _id: objectId(ownerId) })
            if (owner) {
                db.get().collection(collection.OWNER_COLLECTION).findOne({ _id: objectId(ownerId) }).then((profile) => {
                    resolve(profile)
                })
            }
        })
    },
    getOwnerDetails: (ownerId) => {
        return new Promise(async (resolve, reject) => {
            let owner = await db.get().collection(collection.OWNER_COLLECTION).findOne({ _id: objectId(ownerId) })
            if (owner) {
                db.get().collection(collection.OWNER_COLLECTION).findOne({ _id: objectId(ownerId) }).then((response) => {
                    resolve(response)
                })
            }
        })
    },
    editProfile: (details, ownerId) => {
        return new Promise(async (resolve, reject) => {
            let owner = await db.get().collection(collection.OWNER_COLLECTION).findOne({ _id: objectId(ownerId) })
            if (owner) {
                db.get().collection(collection.OWNER_COLLECTION)
                    .updateOne({ _id: objectId(ownerId) }, {
                        $set: {
                            theatername: details.theatername,
                            email: details.email,
                            phonenumber: details.phonenumber,

                        }
                    }).then((response) => {
                        if (response) {
                            resolve({ status: true })
                        } else {
                            resolve({ status: false })
                        }
                    })
            } else {
                resolve({ status: false })
            }
        })
    },
    forgotPassword: (details) => {
        return new Promise(async (resolve, reject) => {
            let owner = await db.get().collection(collection.OWNER_COLLECTION).findOne({ username: details.username })
            if (owner) {
                if (details.email === owner.email) {
                    var code = generator.generate({
                        length: 4,
                        numbers: true
                    });
                    let updateDetails = db.get().collection(collection.OWNER_COLLECTION)
                        .updateOne({ _id: objectId(owner._id) }, {
                            $set: {
                                resetcode: code,

                            }
                        })
                    if (updateDetails) {
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
                            to: owner.email,
                            subject: "Movie booking theater account details",
                            html: `<!DOCTYPE html >

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
                                                                                                            <td class="esd-block-text es-p15b" align="center">
                                                                                                                <h1 style="color: #ffffff; font-size: 69px; font-family: georgia, times, 'times new roman', serif; line-height: 100%;">FORGOT YOUR
                                                                                                                  PASSWORD?</h1>
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
                                                                                                        <td class="esd-block-image es-p5t es-p5b" align="center" style="font-size:0"><a target="_blank"><img src="https://onuexc.stripocdn.email/content/guids/CABINET_dd354a98a803b60e2f0411e893c82f56/images/23891556799905703.png" alt style="display: block;" width="175"></a></td>
                                                                                                      </tr>
                                                                                                        <tr>
                                                                                                            <td class= esd-block-text es-m-txt-l" align="left">
                                                                                                                <h2 style="padding:12px; font-size: 28px;">HI,${owner.username}</h2>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                        <tr>
                                                                                                            <td class="esd-block-image es-m-txt-l" align="left" style="font-size:0"><a target="_blank" href="https://esputnik.com/viewInBrowser"><img src="https://tlr.stripocdn.email/content/guids/CABINET_6ebdc9f620b6c98ec92e579217982603/images/99301524564595313.png" alt style="display: block;" width="75"></a></td>
                                                                                                        </tr>
                                                                                                        <tr>
                                                                                                            <td style="padding:12px;" class="esd-block-text es-p15t" align="left">
                                                                                                                <p style="    font-size: 16px; font-family: arial, 'helvetica neue', helvetica, sans-serif;line-height: 150%; color: gray;"><span  class="product-description">There was a request to change your password!</span></p>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                        <tr>
                                                                                                            <td style="padding:12px;" class="esd-block-text es-p25t es-p10b" align="left">
                                                                                                                
                                                                                                                <p >Reset code: <center><h1 style="letter-spacing: 22PX;">${code}</h1></center> </p>
                                                                                                                
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                        <tr>
                                                                                                            <td style="padding:12px;" class="esd-block-text es-p15t" align="left">
                                                                                                                <p><span class="product-description" style="color: black;">If did not make this request, just ignore this email. Otherwise, please enter the code</span></p>
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
                        </html>`};
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                                resolve({ status: false, message: "Email not send please try again " })
                            } else {
                                console.log("Email sent: " + info.response);
                                resolve({ status: true, "ownerId": owner._id })
                            }
                        });
                    } else {
                        resolve({ status: false, message: "Error" })
                    }
                } else {
                    resolve({ status: false, message: "Email not found " })
                }
            } else {
                resolve({ status: false, message: "Owner not exist retry" })
            }
        })
    },
    checkCode: (details, ownerId) => {
        return new Promise(async (resolve, reject) => {
            let owner = await db.get().collection(collection.OWNER_COLLECTION).findOne({ _id: objectId(ownerId) })
            if (owner) {
                if (details.code === owner.resetcode) {
                    db.get().collection(collection.OWNER_COLLECTION)
                        .updateOne({ _id: objectId(ownerId) }, {
                            $set: {
                                passwordReset: true
                            }
                        }).then((response) => {
                            if (response) {
                                resolve({ status: true, "ownerId": owner._id })
                            } else {
                                resolve({ status: true })
                            }
                        })
                } else {
                    resolve({ status: false })
                }
            } else {
                resolve({ status: false })
            }

        })
    },
    updatePassword: (details, ownerId) => {
        return new Promise(async (resolve, reject) => {
            let owner = await db.get().collection(collection.OWNER_COLLECTION).findOne({ _id: objectId(ownerId) })
            if (owner.passwordReset) {
                details.confirmpassword = await bcrypt.hash(details.confirmpassword, 10)
                db.get().collection(collection.OWNER_COLLECTION)
                    .updateOne({ _id: objectId(ownerId) }, {
                        $set: {
                            password: details.confirmpassword,
                            resetcode: "0",
                            passwordReset: false
                        }
                    }).then((response) => {
                        if (response) {
                            resolve({ status: true })
                        } else {
                            resolve({ status: false })
                        }
                    })
            } else {
                resolve({ status: false })
            }
        })
    },
    getMoviesTitle: (ownerId) => {
        return new Promise(async (resolve, reject) => {
            let movies = await db.get().collection(collection.MOVIE_COLLECTION).find({ owner: objectId(ownerId) }).toArray()
            resolve(movies)
        })
    },
    addShow: (details, ownerId) => {
        details.owner = ownerId
        details.screenId = objectId(details.screenId)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SHOW_COLLECTION).insertOne(details).then((response) => {
                if (response) {
                    resolve({ status: true })
                } else {
                    resolve({ status: false })
                }
            })
        })
    },
    getShedule: (screenId) => {
        return new Promise(async (resolve, reject) => {
            let show = await db.get().collection(collection.SHOW_COLLECTION).find({ screenId:objectId(screenId) }).toArray()
            resolve(show)
        })
    },
    getShowDetails: (showId) => {
        return new Promise(async (resolve, reject) => {
            let show = await db.get().collection(collection.SHOW_COLLECTION).findOne({ _id: objectId(showId) })
            resolve(show)
        })

    },
    updateShow: (details, showId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SHOW_COLLECTION)
                .updateOne({ _id: objectId(showId) }, {
                    $set: {
                        movietitle: details.movietitle,
                        date: details.date,
                        hours: details.hours,
                        minutes: details.minutes,
                        vip: details.vip,
                        premium: details.premium,
                        executive: details.executive,
                        normal: details.normal
                    }
                }).then((response) => {
                    if (response) {
                        resolve({ status: true })
                    } else {
                        resolve({ status: false })
                    }
                })
        })
    },
    deleteShow:(showId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.SHOW_COLLECTION).removeOne({_id:objectId(showId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    addUpcomingMovies:(details,ownerId)=>{
        details.createddate= new Date()
        details.owner=objectId(ownerId)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.UPCOMINGMOVIES_COLLECTION).insertOne(details).then((response)=>{
                resolve(response.ops[0]._id)
            })
        })
    },
    deleteUpcomingMovies:(movieId)=>{
        return new Promise(async(resolve,reject)=>{
            let movie=await  db.get().collection(collection.UPCOMINGMOVIES_COLLECTION).findOne({_id:objectId(movieId)})
            if(movie){
                db.get().collection(collection.UPCOMINGMOVIES_COLLECTION).removeOne({_id:objectId(movieId)}).then((response)=>{
                    if(response){
                        resolve({status:true})
                    }else{
                        resolve({status:false})
                    }
                })
            }else{
                resolve({status:false})
            } 
        })
    },
    UpComingMoviesList:(ownerId)=>{
        return new Promise(async(resolve,reject)=>{
            let upMovieList=await db.get().collection(collection.UPCOMINGMOVIES_COLLECTION).find({owner:objectId(ownerId)}).toArray()
            resolve(upMovieList)
        })
    },
    getScreenDetails:(screenId,showId)=>{
        return new Promise(async(resolve,reject)=>{
            let showDetails=await db.get().collection(collection.SHOW_COLLECTION).findOne({_id:objectId(showId)})
            let screenDetails =await db.get().collection(collection.SCREEN_COLLECTION).findOne({_id:objectId(screenId)})
            if(screenDetails){
                details={}
                details.showDetails=showDetails
                details.screenDetails=screenDetails
                resolve(details)
            }else{
                resolve(false)
            }
        })
    },
    addSeats:(screenId,showId,details)=>{
        details.screenId=objectId(screenId)
        details.showId=objectId(showId)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.SEAT_COLLECTION).insertOne(details).then((response)=>{
                resolve(response)
            })
        })
    }
}