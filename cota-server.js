'use strict'

//See if mock API was specified
let movieDataAPIPath
if(process.argv[2] === 'mock') {
  console.debug('Running API in Mock environment')
  movieDataAPIPath = './data/movie-database-data-mock'
}
else {
  movieDataAPIPath = './data/movie-database-data'
}

//See if mock service was specified
let cotaServicesPath
if(process.argv[3] === 'mock') {
  console.debug('Running Service in Mock environment')
  cotaServicesPath = './service/cota-services-mock'
}
else {
  cotaServicesPath = './service/cota-services'
}

//Load env variables
const env = require('./env.json')
Object.assign(process.env, env)

//Require dependencies
const express = require('express')
const request = require('request')

//Require project files
const webApi = require('./web-api/cota-web-api')
const bodyParser = require('./middleware/body-parser')
const movieDataAPI = require(movieDataAPIPath).init(request, process.env.BASE_URL, process.env.MOVIE_API_TOKEN)
const cotaDB = require('./data/cota-db').init(process.env.ES_BASE_URL, process.env.ES_GROUPS_INDEX)
const cotaServices = require(cotaServicesPath).init(movieDataAPI, cotaDB)
const cotaController = require('./web-api/controller/cota-controller').init(cotaServices)
const groupController = require('./web-api/controller/group-controller').init(cotaServices)

//Initialize express
const app = express()

//Set middleware and routes
app.use(bodyParser)
app.use('/', webApi(express.Router(), cotaController, groupController))

//Start server
app.listen(process.env.PORT, () => 
    console.log('HTTP server listening on port ' + process.env.PORT)
)