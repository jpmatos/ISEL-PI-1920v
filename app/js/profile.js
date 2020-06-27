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
            // if(invites.pendings.length > 0)
            //     invites.pendings.forEach(pending => {
            //         document
            //             .getElementById(pending._id)
            //             .addEventListener('click', deleteInvite)
            //     })
        })
        .then(() => {
            document
                .getElementById('buttonLogout')
                .addEventListener('click', logoutHandler)
        })

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
            .catch(console.log)
    }
}
