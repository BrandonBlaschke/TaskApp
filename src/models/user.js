const mongoose = require('mongoose')
const task = require('./task')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        },
        default: 0
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        validate(val) {
            if (!validator.isEmail(val)) {
                throw new Error('Email is invalid')
            }
        },
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(val) {
            if (val.toLowerCase().includes("password")) {
                throw new Error('Password is invalid')
            }
        }
    },
    tokens: [{
        token: {
            required: true,
            type: String
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

// Virtual property, relationship between two entities, the Tasks owner field and the User _id field
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// Generate a authentication token using jsonwebtoken
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    // Add token to the list of tokens on the user object
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

// Return only the properties that need to be return, securtiy risks
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

// Setting up a custom function on model 
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})

    if (!user) {
        throw new Error("No user found with that email")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Login in failed')
    }

    return user
}

// Hash password everytime saved
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }

    next()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this

    await task.deleteMany({owner: user._id})

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User