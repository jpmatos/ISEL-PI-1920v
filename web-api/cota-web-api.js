'use strict'

module.exports = (router, cotaController) => {

    router.get('/', (req, res) => cotaController.home(req, res))
    router.get('/popular', (req, res) => cotaController.popular(req, res))
    
    return router
}