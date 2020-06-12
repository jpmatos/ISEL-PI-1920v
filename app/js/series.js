'use strict'

const util = require('./util.js')
const Handlebars = require('handlebars')
const seriesList = require('./../views/seriesList.hbs').default
const seriesSelection = require('./../views/seriesSelection.html')

module.exports = (divMain) => {
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
    }

    function populateSeriesSelection(series) {
        divMain.innerHTML = seriesListView({'series': series})
    }
}