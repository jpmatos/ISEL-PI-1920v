'use strict'

class InviteController{

    constructor(service, boom){
        this.service = service
        this.boom = boom
    }

    static init(service, boom){
        return new InviteController(service, boom)
    }

    invite(req, res, next){
        const groupID = req.params.groupID  //ID
        const inviterID = req.user._id      //ID
        const invitee = req.params.invitee  //name

        this.service
            .inviteToGroup(groupID, inviterID, invitee)
            .then(message => res.status(201).json(message))
            .catch(next)
    }

}
module.exports = InviteController