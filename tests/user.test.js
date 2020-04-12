const request = require("supertest")
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDB} = require('./fixtures/db')

// Run function before each test
beforeEach(setupDB)

// Run after each function test
afterEach(() => {
})

test('Sign Up New User', async () => {
    const resposne = await request(app).post('/users').send({
        name: "TestNam2",
        email: "example@example.com",
        password: "12345678"
    }).expect(201)

    // Things to test
    // Assert that the database was changed correctly 
    const user = await User.findById(resposne.body.user._id)
    expect(user).not.toBeNull()

    // Assert about the resposne 
    expect(resposne.body).toMatchObject({
        user: {
            name: "TestNam2",
            email: "example@example.com"
        }, 
        token: user.tokens[0].token
        
    })

    // Password should not exist
    expect(user.password).not.toBe('12345678')
    
})

test('Log In User', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    // Check token is correct
    const user = await User.findById(response.body.user._id)
    expect(user.tokens[1].token).toBe(response.body.token)

})

test('Log In User Fail', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password + "0234"
    }).expect(400)
})

test('Fetch Profile', async () => {
    await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Fail Fetch Profile', async () => {
    await request(app)
        .get('/me')
        .send()
        .expect(401)
})

test('Unauthenticated User Delete Profile', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Delete Profile', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Upload Avatar', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    // Check Bin data is stored
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Update User', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'NewName'
        })
        .expect(200)
    
    const user = await User.findById(userOneId)
    expect(user.name).toBe("NewName")
})

test('Invalid Update User', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            differentField: 'new field'
        })
        .expect(400)
})