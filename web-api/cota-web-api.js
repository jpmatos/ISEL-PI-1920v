'use strict'

module.exports = (router, cotaController, groupController) => {

    router.get('/', (req, res) => cotaController.home(req, res))
    router.get('/popular', (req, res) => cotaController.popular(req, res))
    router.get('/search/tv', (req, res) => cotaController.searchSerie(req, res))

    router.post('/groups', (req, res) => groupController.create(req, res))
    
    return router
}