'use strict'

const util = require('./util.js')
const popularList = require('./../views/popularList.hbs').default
const Handlebars = require('handlebars/dist/handlebars')

module.exports = async (divMain) => {
    const url = `/api/popular`
    const popularListView = Handlebars.compile(popularList)

    util.getJSON(url)
        .then(movies => {
            return populatePopularTable(movies)
        })

    function populatePopularTable(movies) {
        divMain.innerHTML = popularListView({'movies': movies})
    }
}