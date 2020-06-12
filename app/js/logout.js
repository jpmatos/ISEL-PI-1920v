'use strict'

const logout = require('./../views/logout.html')
const util = require('./util.js')

module.exports = (divMain, updateNavbar) => {
    divMain.innerHTML = logout

    document
        .getElementById('buttonLogout')
        .addEventListener('click', logoutHandler)

    function logoutHandler(ev){
        ev.preventDefault()
        util.postJSON('/auth/logout')
            .then(body => {
                updateNavbar()
                window.location.hash = 'login'
            })
            .catch(console.log)
    }
}
