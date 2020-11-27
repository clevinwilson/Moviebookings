const { Db, ObjectId } = require("mongodb")
var collection = require('../config/collection')
const db = require('../config/connection')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectID

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
    }
}