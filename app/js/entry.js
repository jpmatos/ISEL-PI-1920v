'use strict'

//Require bootstrap and handlebars
require('./../../node_modules/bootstrap/dist/css/bootstrap.css')
require('./../../node_modules/bootstrap/dist/js/bootstrap')
const Handlebars = require('handlebars')

//Require front-end JS and HashRouter
const home = require('./home')
const popular = require('./popular')
const series = require('./series')
const groups = require('./groups')
const groupDetails = require('./groupDetails')
const groupSort = require('./groupSort')
const login = require('./login')
const logout = require('./logout')
const sessionHolder = require('./sessionHolder').init()
const router = require('./hashRouter').init(sessionHolder)

//Load main, navbar, and notFound views
const mainView = require('./../views/main.html')
const navView = Handlebars.compile(require('./../views/navbar.hbs').default)
const resourceNotFoundView = Handlebars.compile(require('./../views/resourceNotFound.hbs').default)

//Add mainView and get placeholders references: divMain and divNavbar
document.body.innerHTML = mainView
const divMain = document.getElementById('divMain')
const divNavbar = document.getElementById('divNavbar')

//Initial setup of navbar
getAuthAndInsertNavbar(sessionHolder)

//Set Router's hash paths and others
router
    .use('#home', () => home(divMain))
    .use('#popular', () => popular(divMain))
    .use('#series', (id) => series(divMain, id))
    .use('#groups', () => groups(divMain), true)
    .use('#group', (id) => groupDetails(divMain, id), true)
    .use('#groupSort', (id) => groupSort(divMain), true)
    .use('#login', () => login(divMain, getAuthAndInsertNavbar, sessionHolder))
    .use('#logout', () => logout(divMain, getAuthAndInsertNavbar, sessionHolder))
    .noAuth(() => divMain.innerHTML = resourceNotFoundView({'message': 'Authentication Required'}))
    .fallback(() => divMain.innerHTML = resourceNotFoundView({'message': 'Resource Not Found'}))
    .resourceId(fragment => fragment.split('/')[1])
    .hash(fragment => fragment.split('/')[0])


//Set onhashchange and onload to call update function
window.onhashchange = onHashUpdateHandler
window.onload = onHashUpdateHandler

//Auto-forward to the homepage
if(!window.location.hash) window.location.hash = "home"

function onHashUpdateHandler(){
    router.trigger(),
    updateNav()
}

function updateNav() {
    // Deactivate previous anchor
    const prev = document.querySelector('a.active')
    if(prev) prev.classList.remove('active')

    // Activate anchor in navigation bar
    const fragment = window.location.hash.split('/')[0]
    const option = document.getElementById('nav' + fragment)
    if(option) option.classList.add('active')
}

function getAuthAndInsertNavbar(sessionHolder) {
    sessionHolder.getSession()
        .then(session => {
            divNavbar.innerHTML = navView({ session })
            updateNav()
        })
}