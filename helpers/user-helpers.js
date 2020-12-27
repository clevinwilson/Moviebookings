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
    signup: (details) => {
        return new Promise(async (resolve, reject) => {

            details.signupwithphone = true
            details.signupwithgoogle = false
            details.email = " "
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
        console.log(seats,"llpp");
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
    addCheckout: (details, showId) => {
        console.log(details);
        details.showId = objectId(showId)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CHECKOUT_COLLECTION).insertOne(details).then((response) => {
                resolve(response)
            })

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

                        _id: 1, movietitle: 1, date: 1, screenId: 1,hours:1,minutes:1, screen: { $arrayElemAt: ['$screen', 0] }, theater: { $arrayElemAt: ['$theater', 0] }
                    }
                }


            ]).toArray()
            resolve(timeList)
        })
    },
    placeOrder: (userId, details) => {
        details.status=false
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BOOKING_COLLECTION).insertOne(details).then((response) => {
                db.get().collection(collection.CHECKOUT_COLLECTION).removeOne({ user: objectId(userId) })
                resolve(response.ops[0]._id)
            })
        })
    },
    generateRazorpay: (bookingId, price) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: price*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + bookingId
            };
            instance.orders.create(options, function (err, order) {
                console.log("kkk", order);
                resolve(order)
            });
        })
    },
    verifyPayment:(details)=>{
        return new Promise((resolve,reject)=>{
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'zDZ8GFjzaxyncyKYdabslzOE');
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
            hmac=hmac.digest('hex')
            if(hmac==details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }

        })
    },
    chanePaymentStatus:(orderId)=>{
      
        return new Promise(async(resolve,reject)=>{
            let order =await db.get().collection(collection.BOOKING_COLLECTION).findOne({_id:objectId(orderId)})
            console.log(order,"lklklklklkllkl");
            db.get().collection(collection.BOOKING_COLLECTION)
            .updateOne({_id:objectId(orderId)},
            {
                $set:{
                    status:true
                }
            }).then(()=>{
                resolve()
            })
        })
    }

}