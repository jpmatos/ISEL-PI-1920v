'use strict'

const Handlebars = require('handlebars')
const profile = require('./../views/profile.hbs').default
const util = require('./util.js')

module.exports = (divMain, updateNavbar, sessionHolder) => {
    const profileView = Handlebars.compile(profile)

    util.getJSON('/invite/invites')
        .then(invites => {
            divMain.innerHTML = profileView(invites)
            if(invites.invites.length > 0)
                invites.invites.forEach(invite => {
                    document
                        .getElementById(invite._id)
                        .addEventListener('click', deleteInvite)
                })
            if(invites.pendings.length > 0)
                invites.pendings.forEach(pending => {
                    document
                        .getElementById(pending._id + "_accept")
                        .addEventListener('click', acceptInvite)
                    document
                        .getElementById(pending._id)
                        .addEventListener('click', deleteInvite)
                })
        })
        .then(() => {
            document
                .getElementById('buttonLogout')
                .addEventListener('click', logoutHandler)
        })

    function acceptInvite(ev){
        util.putJSON(`/invite/accept/${ev.target.id.replace("_accept", "")}`)
            .then(() => {
                document
                    .getElementById(ev.target.id.replace("_accept", "") + "_row")
                    .remove()
                util.showAlert('Successfuly joined group.', 'success')
            })
            .catch(err => {
                util.showAlert('Failed to join group.')
                console.log(err)
            })
    }

    function deleteInvite(ev){
        util.deleteJSON(`/invite/delete/${ev.target.id}`)
            .then(() => {
                document
                    .getElementById(ev.target.id + "_row")
                    .remove()
            })
            .catch(err => {
                console.log(err)
            })
    }

    function logoutHandler(ev){
        ev.preventDefault()
        util.postJSON('/auth/logout')
            .then(() => {
                return sessionHolder.updateSession()
            })
            .then (() => {
                updateNavbar(sessionHolder)
                window.location.hash = 'login'
            })
            .catch(err => {
                console.log(err)
            })
    }
}
