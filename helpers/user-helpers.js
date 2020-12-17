const { Db, ObjectId } = require("mongodb")
var collection = require('../config/collection')
const db = require('../config/connection')
const bcrypt = require('bcrypt')
const { response } = require("express")
var objectId = require('mongodb').ObjectID
var nodemailer = require('nodemailer');
var generator = require('generate-password');
const { template } = require("handlebars")

module.exports = {
    doSigin: () => {
        return new Promise((resolve, reject) => {
            let user = db.get().collection(collection)
        })
    },
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
    }
}