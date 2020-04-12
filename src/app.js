const express = require('express')

// This ensures mongoose is ran and it connects to the DB
require('./db/mongoose')

// Import all routes
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()

// Middleware for express example
// app.use((req, res, next) => {
//     console.log(req.method, req.path)

//     // Call next for the correct router to be called and finsh request
//     next()
// })

// Automically parse JSON to object on req.body
app.use(express.json())

// Add routers to project 
app.use(userRouter)
app.use(taskRouter)

module.exports = app;
