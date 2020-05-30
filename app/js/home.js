'use strict'

const home = require('./../views/home.html')

module.exports = (divMain) => {
    divMain.innerHTML = home
}