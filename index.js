require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')

const pages = require('./routes/pages')
const series = require('./routes/series')

const port = process.env.PORT
const mongo = process.env.MONGODB

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

app.use(bodyParser.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use('/', pages)
app.use('/series', series)

mongoose
    .connect(mongo, { useNewUrlParser: true })
    .then(() => {
        app.listen(port, () => console.log('Server Started on ' + port))
    })
    .catch(e => {
        console.log(e)
    })