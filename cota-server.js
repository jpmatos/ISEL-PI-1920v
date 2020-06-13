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
const passport = require('passport')
const nodefetch = require('node-fetch')

//Require webpack
const expressSession = require('express-session')
const bodyParser = require('body-parser')
const webpackConfig = require('./webpack.config.js')
const webpack = require('webpack')
const webpackMiddleware = require('webpack-dev-middleware')
const boom = require('boom')

//Require project files
const cotaApi = require('./web-api/cota-web-api')
const authApi = require('./web-api/auth-web-api')
const movieDataAPI = require(movieDataAPIPath).init(process.env.BASE_URL, process.env.MOVIE_API_TOKEN, nodefetch)
const cotaDB = require('./data/cota-db').init(process.env.ES_BASE_URL, process.env.ES_GROUPS_INDEX, nodefetch)
const authDB = require('./data/cota-db').init(process.env.ES_BASE_URL, process.env.ES_USERS_INDEX, nodefetch)
const cotaServices = require(cotaServicesPath).init(movieDataAPI, cotaDB, boom)
const authServices = require('./service/auth-services').init(authDB, boom)
const cotaController = require('./web-api/controller/cota-controller').init(cotaServices)
const groupController = require('./web-api/controller/group-controller').init(cotaServices)
const authController = require('./web-api/controller/auth-controller').init(authServices, boom)
const errorHandler = require('./middleware/error-handler')

//Passport setup
passport.serializeUser((user, done) => {
    if(user !== undefined)
        done(null, user._id)
})
passport.deserializeUser((userId, done) => {
  // Load an user given its session data
  authServices.getUserById(userId)
    .then(user => done(null, user))
    .catch(err => done(err))
})

//Initialize express
const app = express()

// Middleware
app.use(bodyParser.json())
app.use(expressSession({
  // name: 'session_id',
  secret: '21313213dsadsadsa',
  resave: false,
  // saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());
app.use('/api', cotaApi(express.Router(), cotaController, groupController, boom))
app.use('/auth', authApi(express.Router(), authController))
app.use(webpackMiddleware(webpack(webpackConfig)))
app.use(errorHandler(boom))

//Start server
app.listen(process.env.PORT, () => 
  console.log('HTTP server listening on port ' + process.env.PORT)
)