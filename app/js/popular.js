'use strict'

const util = require('./util.js')
const popularList = require('./../views/popularList.hbs').default
const Handlebars = require('handlebars')

module.exports = async (divMain) => {
    const url = `/api/popular`
    const popularListView = Handlebars.compile(popularList)

    util.getJSON(url)
        .then(movies => sortDescendingMoviesByPopularity(movies))
        .then(movies => populatePopularTable(movies))

    function sortDescendingMoviesByPopularity(movies){
        return movies.sort((first, second) => second.popularity - first.popularity)
    }

    function populatePopularTable(movies) {
        divMain.innerHTML = popularListView({'movies': movies})
    }
}