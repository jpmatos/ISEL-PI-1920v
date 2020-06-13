'use strict'

const login = require('./../views/login.html')
const util = require('./util.js')

module.exports = (divMain, updateNavbar, sessionHolder) => {
    divMain.innerHTML = login

    document
        .getElementById('buttonSignup')
        .addEventListener('click', signupHandler)

    document
        .getElementById('buttonLogin')
        .addEventListener('click', loginHandler)

    function signupHandler(ev){
        ev.preventDefault()
        const username = document.getElementById('inputUsername').value
        const password = document.getElementById('inputPassword').value
        util.postJSON('/auth/register', {username, password})
            .then(body => {
                if(body.error){
                    util.showAlert(body.message)
                }
                else {
                    util.showAlert(`User '${body.username}' sucessfully created`, 'success')
                }
            })
            .catch(console.log)
    }

    function loginHandler(ev){
        ev.preventDefault()
        const username = document.getElementById('inputUsername').value
        const password = document.getElementById('inputPassword').value
        util.postJSON('/auth/login', {username, password})
            .then(body => {
                sessionHolder.updateSession()
                    .then(() => {
                        if(body.error){
                            util.showAlert(body.message)
                        }
                        else {
                            updateNavbar(sessionHolder)
                            window.location.hash = 'logout'
                        }
                    })
            })
            .catch(console.log)
    }
}
