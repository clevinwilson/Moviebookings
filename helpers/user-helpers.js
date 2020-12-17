const { Db, ObjectId } = require("mongodb")
var collection = require('../config/collection')
const db = require('../config/connection')
const bcrypt = require('bcrypt')
const { response } = require("express")
var objectId = require('mongodb').ObjectID
var nodemailer = require('nodemailer');
var generator = require('generate-password');
const { template } = require("handlebars")

module.exports={
    doSigin:()=>{
        return new Promise((resolve, reject)=>{
            let user = db.get().collection(collection)
        })
    },
    getMovies:()=>{
        return new Promise((resolve,reject)=>{
            let moviesList = db.get().collection(collection.MOVIE_COLLECTION).find().limit(4).toArray()
            resolve(moviesList)
        })
    },
    getUpcomingMovie:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.UPCOMINGMOVIES_COLLECTION).find().toArray().then((moviesList)=>{
                resolve(moviesList)
            })
        })
    }
}