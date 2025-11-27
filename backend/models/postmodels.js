const mongoose=require('mongoose')

const postschema=new mongoose.Schema({
author:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Users',
    required:true
},
mediatype:{
    type:String,
    enum:['image','video'],
    required:true
},
media:{
    type:String,
    required:true
},
caption:{
    type:String
},
likes:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    }
],
comments:[
{author:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Users'
},
message:{
    type:String
}
}
]
},{timestamps:true})

const Posts=mongoose.model('Posts',postschema)

module.exports=Posts