'use strict'

const logout = require('./../views/logout.html')
const util = require('./util.js')

module.exports = (divMain, updateNavbar, sessionHolder) => {
    divMain.innerHTML = logout

    document
        .getElementById('buttonLogout')
        .addEventListener('click', logoutHandler)

    function logoutHandler(ev){
        ev.preventDefault()
        util.postJSON('/auth/logout')
            .then(body => {
                return sessionHolder.updateSession()
            })
            .then (() => {
                updateNavbar(sessionHolder)
                window.location.hash = 'login'
            })
            .catch(console.log)
    }
}
