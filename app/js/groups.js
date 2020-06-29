'use strict'

const Handlebars = require('handlebars')
const util = require('./util.js')
const groupsOwner = require('./../views/groupsOwner.hbs').default
const groupsInvitee = require('./../views/groupsInvitee.hbs').default
const groupsCreate = require('./../views/groupsCreate.hbs').default
const groupRow = require('./../views/groupRow.hbs').default

module.exports = async (divMain, sessionHolder) => {
    const baseUrl = '/api/groups'

    const groupsOwnerView = Handlebars.compile(groupsOwner)
    const groupsInviteeView = Handlebars.compile(groupsInvitee)
    const groupsCreateView = Handlebars.compile(groupsCreate)
    const groupRowView = Handlebars.compile(groupRow)

    util.getJSON(baseUrl)
        .then(groups => createGroupsView(groups))

    function createGroupsView(groups) {
        sessionHolder.getSession()
            .then(session => {
                const groupsOwner = groups.filter(item => item.owner === session.user._id)
                const groupsInvitee = groups
                    .filter(item => {
                        return item.invitees.filter(item2 => item2.userID === session.user._id).length > 0
                    })
                divMain.innerHTML = groupsCreateView()
                divMain.insertAdjacentHTML('beforeend', groupsOwnerView({ groupsOwner }))
                divMain.insertAdjacentHTML('beforeend', groupsInviteeView({ groupsInvitee }))
        
                document
                    .getElementById('btnNewGroup')
                    .addEventListener('click', createGroupHandler)
            })
    }

    function createGroupHandler(ev) {
        ev.preventDefault()
        const name = document.getElementById('txtGroupName')
            .value
        const description = document.getElementById('txtGroupDescription')
            .value
        addNewGroup(name, description)
    }

    function addNewGroup(name, description) {
        util.postJSON(baseUrl, { name, description })
            .then(group => addNewGroupToTable(group))
            .catch(err => util.showAlert('Error creating new group: ' + JSON.stringify(err)))
    }

    function addNewGroupToTable(groups) {
        const tbody = document.getElementById('groupsOwnerBody')
        if (tbody) {
            tbody
                .insertRow(tbody.rows.length)
                .innerHTML = groupRowView({ groups: groups })
        }
        else {
            groups['num_series'] = groups.series.length
            document.getElementById('noGroupsFoundCard').remove()
            document.querySelector('form').insertAdjacentHTML('afterend', groupsOwnerView({ 'groupsOwner': [groups] }))
        }
    }
}