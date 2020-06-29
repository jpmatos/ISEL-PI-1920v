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
            .then(addGroupDetailView)
            .then(() => addBtnClickEventListener('btnAddSeriesToGroup', addSeriesHandler))
            .then(() => addBtnClickEventListener('btnDeleteSeriesFromGroup', deleteSeriesHandler))
            .then(() => addBtnClickEventListener('btnDeleteGroup', deleteGroupHandler))
    }

    function addGroupDetailView(group) {
        deleteGroupDetail()
        deleteSeriesForm()
        let total = 0;
        let numberOfRatings = 0;
        divMain.insertAdjacentHTML('beforeend', groupDetailView({'group': group}))
        group.series.forEach(serie => {
            if(serie.rating){
                total += serie.rating
                numberOfRatings++;
                document.getElementById(`rating_${serie.id}`).innerHTML = serie.rating
            }
            addBtnClickEventListener('Button_' + serie.id, ratingSeriesHandler)
        });
        if(numberOfRatings != 0)
            document.getElementById('averageDiv').innerHTML = (total/numberOfRatings).toFixed(2)
    }

    //Button Handlers (Add Series, Remove Series, Delete Group)
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
                addBtnClickEventListener('Button_' + series.id, ratingSeriesHandler)
            }
        } else {
            deleteResourceNotFound()
            createSeriesTable(group.series[0])
            addDeleteButton()
        }
    }

    function ratingSeriesHandler(ev) {
        ev.preventDefault()
        const id = ev.target.id.replace('Button_','')
        const rating = document.getElementById('txtRatingId').value
        util.postJSON(`${baseUrl}${groupID}/series/${id}/rating/${rating}`)
            .then(response => {
                if(response.statusCode == 400)
                    util.showAlert('Error adding rating: ' + response.message)
                else{
                    document.getElementById('averageDiv').innerHTML = response.average.toFixed(2)
                    document.getElementById(`rating_${id}`).innerHTML = rating
                }
            })
        
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
                addBtnClickEventListener('Button_' + series.id, ratingSeriesHandler)
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
