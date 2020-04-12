const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()

const userOne = {
    _id: userOneId,
    name: "TestName2",
    email: "example2@example.com",
    password: "dsalkjf3lk42j34234",
    tokens: [{
        token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()

const userTwo = {
    _id: userTwoId,
    name: "A new name",
    email: "newemail@example.com",
    password: "kljasdfQ@#$@f3lk42j34234",
    tokens: [{
        token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: "A new new task auto created",
    completed: false,
    owner: userOneId
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: "Task two",
    completed: false,
    owner: userTwoId
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: "Third task",
    completed: false,
    owner: userTwoId
}

const setupDB = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOne,
    userOneId,
    setupDB,
    taskOne,
    taskTwo,
    taskThree
}