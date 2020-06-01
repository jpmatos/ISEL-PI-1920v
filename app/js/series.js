'use strict'

const util = require('./util.js')
const Handlebars = require('handlebars')
const seriesList = require('./../views/seriesList.hbs').default
const seriesSelection = require('./../views/seriesSelection.html')

module.exports = (divMain, leagueID) => {
    const baseUrl = `/api/tv`

    const seriesListView = Handlebars.compile(seriesList)
    divMain.innerHTML = seriesSelection

    document
        .getElementById('buttonSearch')
        .addEventListener('click', searchHandler)


    function searchHandler(ev){
        ev.preventDefault()
        const seriesID = document.getElementById('inputSeries').value
        
        util.getJSON(`${baseUrl}/${seriesID}`)
            .then(populateSeriesSelection)
            // .then(onChangeSelect)
            // .then(checkLeagueId)
    }

    function populateSeriesSelection(series) {
        divMain.innerHTML = seriesListView({'series': series})
    }

    function changeSelectedIndex(select, value) {
        const opts = select.options;
        for(var opt, j = 0; opt = opts[j]; j++) {
            if(opt.value == value) {
                select.selectedIndex = j;
                break;
            }
        }
    }

    function checkLeagueId(select) {
        if(leagueID) {
            createTableView(leagueID)
            changeSelectedIndex(select, leagueID)
        }
    }

    function onChangeSelect() {
        const select = document.getElementById('selectLeagueId')
        select.onchange = () => {
            const value = select.options[select.selectedIndex].value
            createTableView(value)
        }
        return select
    }

    // function cleanTable() {
    //     const tableLeagueTeams = document.getElementById('tableLeagueTeams')

    //     if(tableLeagueTeams) {
    //         tableLeagueTeams.remove()
    //     }

    //     const divTeamsNotFound = document.getElementById('divTeamsNotFound')

    //     if(divTeamsNotFound) {
    //         divTeamsNotFound.remove()
    //     }
    // }

    // function populateTable(teams) {
    //     cleanTable()
    //     divMain.insertAdjacentHTML('beforeend', seriesView({'teams': teams}))
    // }

    // function createTableView(leagueID) {
    //     util.getJSON(`${baseUrl}${leagueID}/teams`)
    //         .then(teams => populateTable(teams))
    // }
}