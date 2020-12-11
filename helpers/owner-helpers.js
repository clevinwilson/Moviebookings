const { Db, ObjectId } = require("mongodb")
var collection = require('../config/collection')
const db = require('../config/connection')
const bcrypt = require('bcrypt')
const { response } = require("express")
var objectId = require('mongodb').ObjectID
var nodemailer = require('nodemailer');
var generator = require('generate-password');
module.exports={
    doLogin:(details)=>{
        let loginStatus = true
        let response = {}
        return new Promise(async(resolve,reject)=>{
            let owner =await db.get().collection(collection.OWNER_COLLECTION).findOne({username:details.username})
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
            }else{
                console.log("Owner not exist");
                resolve({status:false})
            }
        })
    },
    addScreen:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.SCREEN_COLLECTION).insertOne(details).then((response)=>{
                resolve(response)
            })
        })
    },
    getScreens:()=>{
        return new Promise(async(resolve,reject)=>{
           let screens=await db.get().collection(collection.SCREEN_COLLECTION).find().toArray()
           resolve(screens)
        })
    }
}