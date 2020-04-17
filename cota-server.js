'use strict'

const env = require('./env.json')
Object.assign(process.env, env)

const express = require('express')
const request = require('request')

const webApi = require('./web-api/cota-web-api')
const bodyParser = require('./middleware/body-parser')
const movieDataAPI = require('./data/movie-database-data').init(request, process.env.BASE_URL, process.env.MOVIE_API_TOKEN)
const cotaDB = require('./data/cota-db').init()
const cotaServices = require('./service/cota-services').init(movieDataAPI, cotaDB)
const cotaController = require('./web-api/controller/cota-controller').init(cotaServices)
const groupController = require('./web-api/controller/group-controller').init(cotaServices)

const app = express()
app.use(bodyParser)
app.use('/', webApi(express.Router(), cotaController, groupController))
app.listen(process.env.PORT, () => 
    console.log('HTTP server listening on port ' + process.env.PORT)
)