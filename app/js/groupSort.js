'use strict'

const Handlebars = require('handlebars')
const groupSort = require('./../views/groupSort.hbs').default
const groupSortSearch = require('./../views/groupSortSearch.hbs').default
const groupSelection = require('./../views/groupSelection.hbs').default
const util = require('./util.js')

module.exports = (divMain) => {
    const baseUrl = '/api/groups/'

    const groupSelectionView = Handlebars.compile(groupSelection)
    const groupSortSearchView = Handlebars.compile(groupSortSearch)
    const groupSortView = Handlebars.compile(groupSort)

    util.getJSON(baseUrl)
        .then(populateGroupSelection)
        .then(selectGroupHandler)
        .then(addSearchSort)

    function populateGroupSelection(groups) {
        divMain.innerHTML = groupSelectionView({ 'groups': groups })
    }

    function selectGroupHandler(){
        const select = document.getElementById("selectGroupId")
        if(select)
            select.onchange = deleteSortTable
    }

    function addSearchSort(){
        divMain.insertAdjacentHTML('beforeend', groupSortSearchView())
        addBtnClickEventListener('searchSort', searchSortHandler)
    }

    function searchSortHandler(ev) {
        ev.preventDefault()

        const groupID = document.getElementById('selectGroupId').value
        const min = document.getElementById('txtSortMin').value
        const max = document.getElementById('txtSortMax').value

        util.getJSON(`${baseUrl}${groupID}/series?min=${min}&max=${max}`)
            .then(series => populateSortTable(series))
    }

    function populateSortTable(series) {
        deleteSortTable()
        divMain.insertAdjacentHTML('beforeend', groupSortView({'series': series}))
    }

    function deleteSortTable(){
        const divSortTable = document.getElementById('divSortTable')
        if(divSortTable)
            divSortTable.remove()
    }

    function addBtnClickEventListener(id, handler) {
        const btn = document.getElementById(id)
        if(btn) btn.addEventListener('click', handler)
    }
}