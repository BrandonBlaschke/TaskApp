const request = require("supertest")
const app = require('../src/app')
const Task = require('../src/models/task')
const { userOneId, userOne, setupDB, taskOne, taskTwo, taskThree} = require('./fixtures/db')

// Run function before each test
beforeEach(setupDB)

test('Create Task', async () => {
    const resposne = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "This is a new task"
        })
        .expect(201)
    
        const task = await Task.findById(resposne.body._id)
        expect(task).not.toBeNull()

        // Check completed is false 
        expect(task.completed).toEqual(false)
})


test('Get all tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toEqual(1)
})

test('Invalid Delete Task', async () => {
    const response = await request(app)
        .delete('/tasks/' + taskTwo._id)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404)
    
    const task = Task.findById(taskTwo._id)
    expect(task).not.toBeNull()
})