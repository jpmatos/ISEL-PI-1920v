'use strict'

function setInviteRouter(router, inviteController, requireAuth) {
    
    router.post('/group/:groupID/user/:invitee',
        requireAuth, (req, res, next) => inviteController.invite(req, res, next))

    return router
}
module.exports = setInviteRouter
