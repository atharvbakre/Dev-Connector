const express = require('express')
const mongoose = require('mongoose')

const users = require('./routes/api/users')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/posts')

const app = express()

// MongoDB URI
const mongoDBURI = require('./config/keys').mongoDBURI;

// Connect to MongoDB
mongoose   
    .connect(mongoDBURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connected!'))
    .catch(error => console.log(error))

// Use routes
app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/posts', posts)

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Working fine on PORT: ${port}!`))