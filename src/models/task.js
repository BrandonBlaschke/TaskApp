const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        default: false
    },
    completed: {
        type: Boolean,
        trim: true,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task