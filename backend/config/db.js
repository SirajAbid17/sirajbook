const mongoose=require('mongoose')
require('dotenv').config
const dbconnect=async()=>{
    try {
      await  mongoose.connect(process.env.MONGODB_URL)
        console.log('dbconnected successfully!!!')
    } catch (error) {
        console.log(error)
    }
}
module.exports=dbconnect