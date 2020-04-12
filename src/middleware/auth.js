const jwt = require("jsonwebtoken")
const User = require('../models/user')

// Middleware for Express.js
const auth = async (req, res, next) => {
    try {
        // Get token
        const token = req.header('Authorization').replace('Bearer ', '')

        // Decode by using verify and the secret used for the token in user model
        const decoded = jwt.verify(token, 'thisismynewcourse')

        // Find a user with the id and check the tokens array to see if it contains the token
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})
        
        if (!user) {
            throw new Error()
        }
        req.token = token
        req.user = user
        next()
    } catch(e) {
        res.status(401).send({error: "Authentication denied"})
    }
}

module.exports = auth;