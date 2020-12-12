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
    addScreen:(details,ownerId)=>{
        details.owner=objectId(ownerId)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.SCREEN_COLLECTION).insertOne(details).then((response)=>{
                resolve(response)
            })
        })
    },
    getAllScreens:(ownerId)=>{
        return new Promise(async(resolve,reject)=>{
           let screens=await db.get().collection(collection.SCREEN_COLLECTION).find({owner:objectId(ownerId)}).toArray()
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
    },
    getMovies:()=>{
        return new Promise(async(resolve,reject)=>{
            let movies=await db.get().collection(collection.MOVIE_COLLECTION).find().toArray()
            resolve(movies)
        })
    },
    getMovieDetails:(id)=>{
        return new Promise(async(resolve,reject)=>{
            let Moviedetails =await db.get().collection(collection.MOVIE_COLLECTION).findOne({_id:objectId(id)})
            resolve(Moviedetails)
        })
    },
    editMovie:(details,movieId)=>{
        return new Promise(async(resolve,reject)=>{
            let movie =await db.get().collection(collection.MOVIE_COLLECTION).findOne({_id:objectId(movieId)})
            if(movie){
                db.get().collection(collection.MOVIE_COLLECTION)
                .updateOne({_id:objectId(movieId)},{
                    $set:{
                        movietitle:details.movietitle,
                        cast:details.cast,
                        director:details.director,
                        releasedate:details.releasedate,
                        hour:details.hour,
                        minute:details.minute,
                        trailerlink:details.trailerlink,
                        language:details.language,
                        type:details.type
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
    deleteMovie:(movieId)=>{
        return new Promise(async(resolve,reject)=>{
            let movie=await db.get().collection(collection.MOVIE_COLLECTION).removeOne({_id:objectId(movieId)})
            if(movie){
                db.get().collection(collection.MOVIE_COLLECTION).removeOne({_id:objectId(movieId)}).then((response)=>{
                    if(response){
                        resolve({status:true})
                    }else{
                        resolve({status:false})
                    }
                })
            }else{
                resolve({status:true})
            }
        })
    },
    changePassword:(details,ownerId)=>{
        return new Promise(async(resolve,reject)=>{
            let owner=await db.get().collection(collection.OWNER_COLLECTION).findOne({_id:objectId(ownerId)})
            if(owner){
                let oldPassword =await bcrypt.compare(details.oldpassword, owner.password)
                if(oldPassword){
                    details.confirmpassword = await bcrypt.hash(details.confirmpassword, 10)
                    db.get().collection(collection.OWNER_COLLECTION)
                    .updateOne({_id:objectId(ownerId)},{
                        $set:{
                            password:details.confirmpassword
                        }
                    }).then((response)=>{
                        if(response){
                            resolve({status:true})
                        }else{
                            resolve({status:false,"message":"Something Went Wrong try again"})
                        }
                    })
                }else{
                    resolve({status:false,"message":"Incorrect old password. please retry"})
                }
            }else{
                resolve({status:false,"message":"Owner not exist"})
            }
        })
    },
    changeUsername:(details,ownerId)=>{
        return new Promise(async(resolve,reject)=>{
            let owner=await db.get().collection(collection.OWNER_COLLECTION).findOne({_id:objectId(ownerId)})
            if(owner){
                let password =await bcrypt.compare(details.password, owner.password)
                if(password){
                    db.get().collection(collection.OWNER_COLLECTION)
                    .updateOne({_id:ObjectId(ownerId)},{
                        $set:{
                            username:details.newusername
                        }
                    }).then((response)=>{
                        if(response){
                            resolve({status:true})
                        }else{
                            resolve({status:false,"message":"Something Went Wrong"})
                        }
                        
                    })
                }else{
                    resolve({status:false,"message":"Incorrect old password. please retry"})
                }
            }else{
                resolve({status:false,"message":"User not exist"})
            }
        })
    }
}