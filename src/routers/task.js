const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/task')

// PATCH update task
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) =>  allowedUpdates.includes(update))

    // Check to make sure update has the property needed to update
    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates"})
    }

    try {

        // const task = await Task.findById(req.params.id)
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.send(task)
    } catch (e) {
        res.status(400).send()
    }
})

// GET get all tasks
// GET /tasks?completed=boolean: Get all tasks completed or not 
// GET /tasks?limit=int: Get a limit on the number of documents returned 
// GET /tasks?skip=int: How many documents to skip by
// GET /tasks?sortBy=field:asc or :desc: Takes the field or :asc or :desc to order query
router.get('/tasks', auth, async (req, res) => {

    try {
        // const tasks = await Task.find({owner: req.user._id})

        // If not query provided then get all tasks, otherwise check query and search
        const match = {}
        const sort = {}

        if (req.query.completed) {
            match.completed = req.query.completed === "true"
        }

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === "desc" ? -1 : 1
        }

        // Get all tasks that query that match the match object
        await req.user.populate({
            path: 'tasks', 
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

// GET get a specific task
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        // const task = await Task.findById(_id)

        // Get the task by Id and the owners id
        const task = await Task.findOne({_id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        return res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

// POST create task
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        const tasks = await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// DELETE delete a task
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        // const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router