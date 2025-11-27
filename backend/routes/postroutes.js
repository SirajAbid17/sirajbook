const express=require('express')
const postroute=express.Router()
const isauth = require('../middleware/isauth')
const upload = require('../middleware/multer')
const { uploadpost, getallposts, like, comments, saved, getSavedPosts } = require('../controller/postcontroller')
const checkFileSize = require('../middleware/fileSizeCheck')

postroute.post('/upload', isauth, upload.single('media'), checkFileSize, uploadpost)
postroute.get('/getallpost', isauth, getallposts)
postroute.get('/like/:postid', isauth, like)
postroute.post('/comment', isauth, comments)
postroute.get('/saved/:postid', isauth, saved)
postroute.get('/savedposts', isauth, getSavedPosts)

module.exports=postroute