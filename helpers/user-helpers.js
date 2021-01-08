const { Db, ObjectId } = require("mongodb")
var collection = require('../config/collection')
const db = require('../config/connection')
const bcrypt = require('bcrypt')
const { response } = require("express")
const Razorpay = require('razorpay')
var instance = new Razorpay({
    key_id: 'rzp_test_deE2E1795zFmxy',
    key_secret: 'zDZ8GFjzaxyncyKYdabslzOE',
});
var objectId = require('mongodb').ObjectID
var nodemailer = require('nodemailer');
var generator = require('generate-password');
const { template } = require("handlebars")
const { resolve } = require("path")

module.exports = {

    getMovies: () => {
        return new Promise((resolve, reject) => {
            let moviesList = db.get().collection(collection.MOVIE_COLLECTION).find().limit(4).toArray()
            resolve(moviesList)
        })
    },
    getUpcomingMovie: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.UPCOMINGMOVIES_COLLECTION).find().toArray().then((moviesList) => {
                resolve(moviesList)
            })
        })
    },
    signup: (details,longitude,latitude) => {
        return new Promise(async (resolve, reject) => {
            details.longitude=longitude
            details.latitude=latitude
            details.signupwithphone = true
            details.signupwithgoogle = false
            details.password = await bcrypt.hash(details.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(details).then((response) => {
                resolve(response.ops[0])
            })

        })
    },
    doLogin: (details) => {
        let loginStatus = true
        let response = {}
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ phonenumber: details.phonenumber })
            if (user) {
                bcrypt.compare(details.password, user.password).then((status) => {
                    if (status) {
                        console.log("user logedin");
                        response.user = user
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
    userAvailability: (phoneNumber) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ phonenumber: phoneNumber })
            if (user) {
                resolve({ status: false })
            } else {
                resolve({ status: true })
            }
        })
    },
    viewDetails: (movieId) => {
        return new Promise(async (resolve, reject) => {
            let movieDetails = await db.get().collection(collection.MOVIE_COLLECTION).findOne({ _id: objectId(movieId) })
            resolve(movieDetails)
        })
    },
    getBookedSeats: (showId) => {
        return new Promise(async (resolve, reject) => {
            let showDeatils = await db.get().collection(collection.SHOW_COLLECTION).findOne({ _id: objectId(showId) })
            resolve(showDeatils)
        })
    },
    insertBookedSeats: (seats, showId) => {
        console.log(seats, "llpp");
        return new Promise((resolve, reject) => {
            for (let i = 0; i < seats.length; i++) {
                db.get().collection(collection.SHOW_COLLECTION)
                    .updateOne({ _id: ObjectId(showId) },
                        {


                            $push: {
                                bookedseats: seats[i]
                            }

                        }

                    ).then((response) => {
                        resolve()
                    })
            }


        })
    },
    getScreenD: (screenId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SCREEN_COLLECTION).findOne({ _id: objectId(screenId) }).then((screen) => {
                resolve(screen)
            })
        })
    },
    getBookedSeat: (showId, details) => {
        var price = 0
        var seatsDetails = []
        return new Promise(async (resolve, reject) => {
            let show = await db.get().collection(collection.SHOW_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(showId) }
                },
                {
                    $lookup: {
                        from: collection.OWNER_COLLECTION,
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'theater'
                    }
                },
                {
                    $lookup: {
                        from: collection.SCREEN_COLLECTION,
                        localField: 'screenId',
                        foreignField: '_id',
                        as: 'screen'
                    }
                },
                {
                    $project: {

                        _id: 1, movietitle: 1, date: 1, screenId: 1, screen: { $arrayElemAt: ['$screen', 0] }, theater: { $arrayElemAt: ['$theater', 0] }
                    }
                }


            ]).toArray()
            console.log(show, "show");
            if (show) {
                for (let seats in details) {
                    let seat = await db.get().collection(collection.SEAT_COLLECTION).findOne({ showId: objectId(showId), seatName: seats })
                    seatsDetails.push(seat)
                    if (seat) {
                        price = parseInt(price) + parseInt(seat.price)
                    } else {
                        resolve({ status: false })
                    }
                }
                resolve({ status: true, price, seatsDetails, show })
            } else {
                resolve({ status: false })
            }

        })
    },
    addCheckout: (details, showId, userId) => {
        console.log(details);
        details.showId = objectId(showId)
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CHECKOUT_COLLECTION).findOne({ user: ObjectId(userId) })
            if (cart) {
                db.get().collection(collection.CHECKOUT_COLLECTION).removeOne({ _id: objectId(cart._id) }).then((response) => {
                    db.get().collection(collection.CHECKOUT_COLLECTION).insertOne(details).then((response) => {
                        resolve(response)
                    })
                })
            } else {
                db.get().collection(collection.CHECKOUT_COLLECTION).insertOne(details).then((response) => {
                    resolve(response)
                })
            }


        })
    },
    getCart: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CHECKOUT_COLLECTION).findOne({ user: objectId(userId) }).then((cart) => {
                resolve(cart)
            })
        })
    },
    getTime: (movieName) => {
        return new Promise(async (resolve, reject) => {
            let movie = await db.get().collection(collection.SHOW_COLLECTION).findOne({ movietitle: movieName })
            if (movie) {
                let timeList = await db.get().collection(collection.SHOW_COLLECTION).aggregate([
                    {
                        $match: { movietitle: movieName }
                    },
                    {
                        $lookup: {
                            from: collection.OWNER_COLLECTION,
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'theater'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.SCREEN_COLLECTION,
                            localField: 'screenId',
                            foreignField: '_id',
                            as: 'screen'
                        }
                    },
                    {
                        $project: {

                            _id: 1,status:1, movietitle: 1, date: 1, timeperiod: 1, screenId: 1, time: 1, screen: { $arrayElemAt: ['$screen', 0] }, theater: { $arrayElemAt: ['$theater', 0] }
                        }
                    }


                ]).toArray()

                resolve(timeList)
                console.log(timeList);
            } else {
                resolve(false)
            }

        })
    },
    placeOrder: (userId, details) => {
        details.status = false
        return new Promise(async (resolve, reject) => {
            // let show = await db.get().collection(collection.SHOW_COLLECTION).findOne({ _id: objectId(details.showId) })
            // console.log(show.bookedseats[0].seatName,"lll");
            // console.log(details.seats.length);
            // console.log(details.seats);
            // if (show.bookedseats[0]) {
            //     for (let i = 0; i < details.seats.length; i++) {
            //         if (details.seats[i].seatName === show.bookedseats[0].seatName) {
            //             resolve()
            //         }e
            //     }
            // } else {
                details.date=new Date()
                db.get().collection(collection.BOOKING_COLLECTION).insertOne(details).then((response) => {
                    db.get().collection(collection.CHECKOUT_COLLECTION).removeOne({ user: objectId(userId) })
                    resolve(response.ops[0]._id)
                })
            // }
        })
    },

    generateRazorpay: (bookingId, price) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: price * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + bookingId
            };
            instance.orders.create(options, function (err, order) {
                resolve(order)
            });
        })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'zDZ8GFjzaxyncyKYdabslzOE');
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }

        })
    },
    chanePaymentStatus: (orderId, email) => {
        console.log(email);
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
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
                        from: collection.SCREEN_COLLECTION,
                        localField: 'screen',
                        foreignField: '_id',
                        as: 'screen'
                    }
                },
                {
                    $project: {

                        _id: 1, movietitle: 1, seats: 1, date: 1, screenId: 1, hours: 1, minutes: 1, screen: { $arrayElemAt: ['$screen', 0] }, theater: { $arrayElemAt: ['$theater', 0] }
                    }
                }


            ]).toArray()
            seatss = []
            for (i = 0; i < order[0].seats.length; i++) {
                seatss.push(order[0].seats[i].seatName)
                console.log(order[0].seats[i]);
            }

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
                to: email,
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
                                                                                                        <h1 style="color: #ffffff; font-size: 69px; font-family: georgia, times, 'times new roman', serif; line-height: 100%;"></h1>
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
                                                                                                <td class="esd-block-image es-p5t es-p5b" align="center" style="font-size:0"><a target="_blank"><img src="https://i.pinimg.com/474x/27/48/ae/2748ae9571d2e25bc778350e9a5eff24.jpg" alt style="display: block;" width="175"></a></td>
                                                                                              </tr>
                                                                                                <tr>
                                                                                                    <td class= esd-block-text es-m-txt-l" align="left">
                                                                                                        <h2 style="padding:12px; font-size: 28px;">Seat booked successfully</h2>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td class="esd-block-image es-m-txt-l" align="left" style="font-size:0"><a target="_blank" href="https://esputnik.com/viewInBrowser"><img src="https://tlr.stripocdn.email/content/guids/CABINET_6ebdc9f620b6c98ec92e579217982603/images/99301524564595313.png" alt style="display: block;" width="75"></a></td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td style="padding:12px;" class="esd-block-text es-p15t" align="left">
                                                                                                        <p style="    font-size: 16px; font-family: arial, 'helvetica neue', helvetica, sans-serif;line-height: 150%; color: gray;"><span  class="product-description">Thank you for your Booking!</span></p>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td style="padding:12px;" class="esd-block-text es-p25t es-p10b" align="left">
                                                                                                        
                                                                                                        <p >Theater Name: <center><h1 >${order[0].theater.theatername}</h1></center> </p>
                                                                                                        <p >Screen: <center><h1 >${order[0].screen.screenname}</h1></center> </p>
                                                                                                        <p >Seats: <center><h1 >${seatss}</h1></center> </p>
                                                                                                   
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
            db.get().collection(collection.BOOKING_COLLECTION)
                .updateOne({ _id: objectId(orderId) },
                    {
                        $set: {
                            status: true
                        }
                    }).then(() => {
                        resolve()
                    })
        })
    },
    getbookings: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BOOKING_COLLECTION).findOne({ _id: objectId(orderId) }).then((response) => {
                resolve(response)
            })
        })
    },
    getAllBookings:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let bookings =await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
                {
                    $match: {user: objectId(userId) }
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
                        from: collection.SCREEN_COLLECTION,
                        localField: 'screen',
                        foreignField: '_id',
                        as: 'screen'
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

                        _id: 1,status:1, movietitle: 1, seats: 1, date: 1, screenId: 1,price:1, hours: 1, minutes: 1,show: { $arrayElemAt: ['$show', 0] }, screen: { $arrayElemAt: ['$screen', 0] }, theater: { $arrayElemAt: ['$theater', 0] }
                    }
                }


            ]).sort({_id:-1}).toArray()
            resolve(bookings)
        })
    },
    getBookingDetails:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let details =await db.get().collection(collection.BOOKING_COLLECTION).findOne({_id:objectId(orderId)})
            resolve(details)
        })
    },
    getAllMovies:()=>{
        return new Promise(async(resolve,reject)=>{
            let movies=await db.get().collection(collection.MOVIE_COLLECTION).find().toArray()
            resolve(movies)
        })
    },
    gerUserDetails:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).findOne({_id:userId}).then((userdetails)=>{
                resolve(userdetails)
            })
        })
    },
    editProfile:(details,userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id:objectId(userId)},{
                $set:{
                    fullname:details.name
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    changePassword:(details,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
            console.log(user);
            if(user){
                let oldPassword = await bcrypt.compare(details.oldPassword, user.password)
                
                if (oldPassword) {
                    details.confirmpassword = await bcrypt.hash(details.confirmpassword, 10)
                    db.get().collection(collection.USER_COLLECTION)
                        .updateOne({ _id: objectId(userId) }, {
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
            }else {
                resolve({ status: false, "message": "User not exist" })
            }
        })
    },
    googleAu: (details) => {
        return new Promise(async (resolve, reject) => {
            let user =await db.get().collection(collection.USER_COLLECTION).findOne({ gid: details.id })
            if (user) {
                resolve(user)
            } else {
                console.log(details.emails[0].value);
                userdetails = {}
                userdetails.gid = details.id
                userdetails.fullname = details.displayName
                userdetails.email = details.emails[0].value
                userdetails.phonenumber = ""
                userdetails.longitude = ""
                userdetails.latitude = ""
                userdetails.signupwithphone = false
                userdetails.signupwithgoogle = true
                db.get().collection(collection.USER_COLLECTION).insertOne(userdetails).then((response) => [
                    resolve(response.ops[0])
                ])
            }
        })
    },
    addtofavorite: (movieId, userId) => {
        console.log(movieId , userId);
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.FAVORITE_COLLECTION).findOne({ user: userId })
            if (user) {
                let movie = await db.get().collection(collection.FAVORITE_COLLECTION).findOne({ movie: objectId(movieId) })
                if (movie) {
                    resolve({ status: false,message:"Movie already in favorite" })
                } else {


                    db.get().collection(collection.FAVORITE_COLLECTION)
                        .updateOne({ user: objectId(userId) }, {
                           
                                $push: { movie: objectId(movieId) }
                            
                        }).then((response)=>{
                            if(response){
                                resolve({status:true,message:"Added to favorite"})
                            }
                        })
                }
            } else {
                let favorite = {
                    user: objectId(userId),
                    movie: [objectId(movieId)]
                }
                db.get().collection(collection.FAVORITE_COLLECTION).insertOne(favorite).then((response)=>{
                    if(response){
                        resolve({status:true,message:"Added to favorite"})
                    }else{
                        resolve({status:false,message:"Error"})
                    }
                })

            }
        })
    }

}