const express = require('express')
const sharp = require('sharp')
const multer = require('multer')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const { sendWelcomeEmail, sendOnCancelationEmail} = require('../emails/account')

// POST create user
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }

    // Old code on how to handle promises 
    // user.save().then(() => {
    //     res.status(201).send(user)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })
})

// POST login a user
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (e) {
        res.status(400).send()
    }
})

// Limit file size to 1mb and filter for image files only 
const upload = multer({ 
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {

        // Call back function to return error if not image file.
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error('Please upload a image file'))
        }

        cb(undefined, true)
    }
})

// POST Upload user image 
// avatar is the key value par for the http post request 
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        // convert all image files to png and to a size of 250x250
        console.log('test')
        const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
        console.log('test2')
        req.user.avatar = buffer
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
}, (error, req, res, next) => {
    // Handles Errors and allows you to return json back
    res.status(400).send({ error: error.message})
})

// DELETE Remove avatar image from user profile
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        sendOnCancelationEmail(user.email, user.name)
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// GET Get the avatar image file from server by user id
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error("No user found")
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

// GET get a specific user
// uses auth middleware to run authentication checks 
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id

//     try {
//         const user = await User.findById(_id)

//         if (!user) {
//             return res.status(404).send()
//         }

//         res.send(user)
//     } catch (e) {
//         res.status(500).send(e)
//     }
// })

// GET get your user data
router.get('/me', auth, async (req, res) => {

    // Middleware attachs user object if successfully logged in so we can use that object.
    res.send(req.user)
})

// GET get all users 
// router.get('/users', auth, async (req, res) => {

//     res.send(req.user)
//     // try {
//     //     const users = await User.find({})
//     //     res.send(users)
//     // } catch (e) {
//     //     res.status(500).send(e)
//     // }
// })

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []

        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// PATCH update user 
router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password']
    const isValidOperation = updates.every((update) =>  allowedUpdates.includes(update))

    // Check to make sure update has the property needed to update
    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates"})
    }

    try {

        // Second way to use middle ware with mongoose
        // const user = await User.findById(req.params.id)
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        // new is to return the new object and runValidators to check validation on object 
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// DELETE delete a user 
router.delete('/users/me', auth, async (req, res) => {
    try {
        // Old code to delete user
        // const user = await User.findByIdAndDelete(req.user._id)

        // if (!user) {
        //     return res.status(404).send()
        // }

        await req.user.remove()

        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router
