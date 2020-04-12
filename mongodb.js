const {MongoClient, ObjectID} = require('mongodb');

const connectionURL = "mongodb://127.0.0.1:27017"
const database = "task-manager"

const id = new ObjectID()

// To start mongo DB run this command in Node_course D:\Documents\Coding\mongodb\bin\mongod.exe --dbpath=D:/Documents/Coding/mongodb-data

// Connect to mongodb server
MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.log("CANT CONNECT DB: " + error)
    }

    // Connect or create table 
    const db = client.db(database)

    // DELETE
    db.collection('users').deleteOne({
        name: "Brandon2"
    }).then((result) => {
        console.log(result)   
    }).catch((err) => {
        console.log(err)
    })


    // UPDATE
    //  Have to use mongodb operators to udpate documents
    // db.collection('users').updateOne({
    //     _id: new ObjectID('5e6f229206a542499034769a')
    // }, {
    //     $set: {
    //         age: 24
    //     }
    // }).then((res) => {
    //     console.log(res)
    // }).catch((error) => {
    //     console.log(error)
    // })

    // db.collection('tasks').updateMany({
    //     completed: true
    // }, {
    //     $set: {
    //         completed: false
    //     }
    // }).then((res) => {
    //     console.log(res)
    // }).catch((err) => {
    //     console.log(err)
    // })

    // READ
    // // Query for a single document using name and id
    // db.collection("users").findOne({_id: new ObjectID("5e6f2800e095054c94b6d341"), name: 'Jen'}, (error, user) => {
    //     if (error) {
    //         return console.log('unable to fetch')
    //     }
    //     console.log(user);
    // })

    // Get multiple values back from query, return curosr/pointer in DB that you can use callbacks on
    // db.collection("users").find({age: "1"}).toArray((error, users) => {
    //     console.log(users);
    // })

    // CREATE
    // db.collection('users').insertOne({
    //     _id: id,
    //     name: 'Brandon2',
    //     age: '12'
    // }, (error, result) => {
    //     if (error) {
    //         return console.log("Unable to insert user")
    //     }
    //     console.log(result.ops)
    // })

    // db.collection('users').insertMany([
    //     {
    //         name: 'Jen',
    //         age: 28
    //     },
    //     {
    //         name: "Cortona",
    //         age: 7
    //     }
    // ], (error, result) => {
    //     if (error) {
    //         return console.log("ERROR: " + error)
    //     }

    //     console.log(result.ops)
    // })
})