'use strict'

const env = require('./env.json')
Object.assign(process.env, env)

const express = require('express')
const request = require('request')

const webApi = require('./web-api/cota-web-api')
const movieDataAPI = require('./data/movie-database-data').init(request, process.env.BASE_URL, process.env.MOVIE_API_TOKEN)
const cotaServices = require('./service/cota-services').init(movieDataAPI)
const cotaController = require('./web-api/controller/cota-controller').init(cotaServices)

const app = express()
app.use('/', webApi(express.Router(), cotaController))

app.listen(process.env.PORT, () => 
    console.log('HTTP server listening on port ' + process.env.PORT)
)