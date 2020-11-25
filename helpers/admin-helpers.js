const { Db } = require("mongodb")
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
    }
}