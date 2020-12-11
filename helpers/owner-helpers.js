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
    },
    getScreen:(ScreenId)=>{
        return new Promise(async(resolve,reject)=>{
            let screen=await db.get().collection(collection.SCREEN_COLLECTION).findOne({_id:objectId(ScreenId)})
            resolve(screen)
        })
    },
    editScreen:(details,id)=>{
        return new Promise(async(resolve,reject)=>{
            let screen=await db.get().collection(collection.SCREEN_COLLECTION).findOne({_id:objectId(id)})
            if(screen){
                db.get().collection(collection.SCREEN_COLLECTION)
                .updateOne({_id:objectId(id)},{
                    $set:{
                        screenname:details.screenname,
                        seatno:details.seatno
                    }
                }).then((response)=>{
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
    deleteScreen:(screenId)=>{
        return new Promise(async(resolve,reject)=>{
            let screen=await db.get().collection(collection.SCREEN_COLLECTION).findOne({_id:objectId(screenId)})
            if(screen){
                db.get().collection(collection.SCREEN_COLLECTION).removeOne({_id:objectId(screenId)}).then((response)=>{
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
    addMovie:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.MOVIE_COLLECTION).insertOne(details).then((response)=>{
                resolve(response.ops[0]._id)
            })
        })
    }
}