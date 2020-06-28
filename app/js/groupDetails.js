'use strict'

const Handlebars = require('handlebars')
const groupSelection = require('./../views/groupSelection.hbs').default
const groupDetail = require('./../views/groupDetail.hbs').default
const seriesRow = require('./../views/seriesRow.hbs').default
const resourceNotFound = require('./../views/resourceNotFound.hbs').default
const seriesTable = require('./../views/seriesTable.html')
const deleteButton = require('./../views/deleteButton.html')
const util = require('./util.js')

module.exports = (divMain, groupID) => {
    const baseUrl = 'api/groups/'
    const baseInviteUrl = 'invite/'

    const groupSelectionView = Handlebars.compile(groupSelection)
    const groupDetailView = Handlebars.compile(groupDetail)
    const seriesRowView = Handlebars.compile(seriesRow)
    const resourceNotFoundView = Handlebars.compile(resourceNotFound)

    util.getJSON(baseUrl)
        .then(populateGroupSelection)
        .then(onChangeSelect)
        .then(checkGroupId)


    //Drop-down group selector
    function populateGroupSelection(groups) {
        divMain.innerHTML = groupSelectionView({ 'groups': groups })
    }

    function onChangeSelect() {
        const select = document.getElementById('selectGroupId')
        if (select) {
            select.onchange = () => {
                groupID = select.options[select.selectedIndex].value
                createGroupDetailView(groupID)
            }
        }
        return select
    }

    function checkGroupId(select) {
        if (groupID) {
            createGroupDetailView(groupID)

            const opts = select.options;
            for (var opt, j = 0; opt = opts[j]; j++) {
                if (opt.value == groupID) {
                    select.selectedIndex = j;
                    break;
                }
            }
        }
    }

    //Detailed View
    function createGroupDetailView(groupID) {
        util.getJSON(`${baseUrl}${groupID}`)
            .then(group => {
                addGroupDetailView(group)
                return group
            })
            .then(addBtnClickEventsForKicks)
            .then(() => addBtnClickEventListener('btnInvite', addInviteHandler))
            .then(() => addBtnClickEventListener('btnAddSeriesToGroup', addSeriesHandler))
            .then(() => addBtnClickEventListener('btnDeleteSeriesFromGroup', deleteSeriesHandler))
            .then(() => addBtnClickEventListener('btnDeleteGroup', deleteGroupHandler))
    }

    function addGroupDetailView(group) {
        deleteGroupDetail()
        deleteSeriesForm()
        divMain.insertAdjacentHTML('beforeend', groupDetailView({'group': group}))
    }

    //Button Handlers (Add Series, Remove Series, Delete Group)
    function addInviteHandler(ev) {
        ev.preventDefault()
        const invitee = document.getElementById('txtInviteeName').value
        if(invitee != ""){
            util.postJSON(`${baseInviteUrl}group/${groupID}/user/${invitee}`)
            .then(res =>  {
                if(res.statusCode >= 400)
                    util.showAlert(res.message)
                else
                    util.showAlert(res.message, 'success')
            })
            .catch(err => util.showAlert(err))
        }
    }

    function addSeriesHandler(ev) {
        ev.preventDefault()
        const seriesID = document.getElementById('txtSeriesId').value
        if(!seriesExists(seriesID)) {
            util.putJSON(`${baseUrl}${groupID}/series/${seriesID}`)
                .then(addSeriesRow)
                .catch(err => util.showAlert('Error adding series to group: ' + JSON.stringify(err)))
        }
    }

    function deleteSeriesHandler(ev) {
        ev.preventDefault()
        const seriesID = document.getElementById('txtSeriesId').value
        if(seriesExists(seriesID)) {
            util.deleteJSON(`${baseUrl}${groupID}/series/${seriesID}`)
                .then(() => deleteSeriesRow(seriesID))
                .catch(err => util.showAlert('Error removing series from group: ' + JSON.stringify(err)))
        }
    }

    function deleteGroupHandler(ev) {
        ev.preventDefault()
        util.deleteJSON(`${baseUrl}${groupID}`)
            .then(() => deleteGroupDetail())
            .then(() => deleteSeriesForm())
            .then(() => refreshGroupSelection())
    }
    

    //OnClick Events (add, remove elements)
    function deleteGroupDetail() {
        const divGroupDetail = document.getElementById('divGroupDetail')
        if(divGroupDetail) {
            divGroupDetail.remove()
        }
    }

    function deleteSeriesForm() {
        const seriesForm = document.getElementById('seriesForm')
        if(seriesForm) {
            seriesForm.remove()
        }
    }

    function addSeriesRow(group) {
        const tbody = document.getElementById('seriesTableBody')
        if(tbody) {
            if(tbody.rows.length != group.series.length) {
                const series = group.series[group.series.length - 1]
                tbody.insertAdjacentHTML('beforeend', seriesRowView({'series': series}))
            }
        } else {
            deleteResourceNotFound()
            createSeriesTable(group.series[0])
            addDeleteButton()
        }
    }

    function deleteSeriesRow(seriesID) {
        const row = document.getElementById(`Series_${seriesID}`)
        if(row) row.remove()
        if(document.querySelector('tbody').rows.length == 0) {
            deleteDivSeriesTable()
            addResourceNotFound()
            removeDeleteButton()
        }
    }

    function deleteDivSeriesTable() {
        const divSeriesTable = document.getElementById('divSeriesTable')
        if(divSeriesTable)
            divSeriesTable.remove()
    }

    function addResourceNotFound() {
        const divGroupDetail = document.getElementById('divGroupDetail')
        if(divGroupDetail) {
            divGroupDetail.insertAdjacentHTML('beforeend', resourceNotFoundView({'message': 'No Series found'}))
        }
    }

    function deleteResourceNotFound() {
        const divSeriesNotFound = document.getElementById('divSeriesNotFound')
        if(divSeriesNotFound)
            divSeriesNotFound.remove()
    }

    function createSeriesTable(series) {
        const divGroupDetail = document.getElementById('divGroupDetail')

        if(divGroupDetail) {
            divGroupDetail.insertAdjacentHTML('beforeend', seriesTable)
            document
                .getElementById('seriesTableBody')
                .insertAdjacentHTML('beforeend', seriesRowView({'series': series}))
        }
    }

    function addDeleteButton() {
        const seriesForm = document.getElementById('seriesForm')
        if(seriesForm) {
            seriesForm.insertAdjacentHTML('beforeend', deleteButton)
            addBtnClickEventListener('btnDeleteSeriesFromGroup', deleteSeriesHandler)
        }
    }

    function removeDeleteButton() {
        const btnDeleteSeriesFromGroup = document.getElementById('btnDeleteSeriesFromGroup')
        if(btnDeleteSeriesFromGroup)
            btnDeleteSeriesFromGroup.remove()
    }

    function refreshGroupSelection() {
        const selectGroupId = document.getElementById('selectGroupId')
        if(selectGroupId) {
            if(selectGroupId.options.length == 2) {
                divMain.insertAdjacentHTML('beforeend', groupDetailView(null))
                selectGroupId.remove()
            } else {
                selectGroupId.remove(selectGroupId.selectedIndex)
                selectGroupId.selectedIndex = 0
            }
        }
    }

    function addBtnClickEventsForKicks(group){
        group.invitees.forEach(invitee => 
            addBtnClickEventListener(invitee.userID, () => 
                kickInvitee(invitee.userID)))
    }

    function kickInvitee(inviteeID){
        util.putJSON(`${baseInviteUrl}group/${groupID}/kick/${inviteeID}`)
            .then(() => document.getElementById(inviteeID + '_row').remove())
    }


    //Other functions
    function addBtnClickEventListener(id, handler) {
        const btn = document.getElementById(id)
        if(btn) 
            btn.addEventListener('click', handler)
    }

    function seriesExists(seriesID) {
        return document.getElementById(`Series_${seriesID}`)
    }
}
