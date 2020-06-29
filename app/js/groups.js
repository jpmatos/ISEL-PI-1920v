'use strict'

const Handlebars = require('handlebars')
const util = require('./util.js')
const groups = require('./../views/groups.hbs').default
const groupRow = require('./../views/groupRow.hbs').default

module.exports = async (divMain) => {
    const baseUrl = '/api/groups'

    const groupsView = Handlebars.compile(groups)
    const groupRowView = Handlebars.compile(groupRow)

    util.getJSON(baseUrl)
        .then(groups => createGroupsView(groups))

    function createGroupsView(groups) {
        divMain.innerHTML = groupsView({ groups })
        document
            .getElementById('btnNewGroup')
            .addEventListener('click', createGroupHandler)
    }

    function createGroupHandler(ev) {
        ev.preventDefault()
        const name = document.getElementById('txtGroupName')
            .value
        const description = document.getElementById('txtGroupDescription')
            .value
        const checkPrivate = document.getElementById('checkPrivate')
            .checked
        addNewGroup(name, description, checkPrivate)
    }

    function addNewGroup(name, description, checkPrivate) {
        util.postJSON(baseUrl, { name, description, checkPrivate })
            .then(group => { 
                addNewGroupToTable(group)
            })
            .catch(err => {
                util.showAlert('Error creating new group: ' + JSON.stringify(err))
            })
    }

    function addNewGroupToTable(groups) {
        const tbody = document.querySelector('tbody')
        if (tbody) {
            tbody
                .insertRow(tbody.rows.length)
                .innerHTML = groupRowView({ groups })
        }
        else {
            groups['num_series'] = groups.series.length
            createGroupsView([groups])
        }
    }
}