class InviteService {

    constructor(groupDB, authDB, inviteDB, boom){
        this.groupDB = groupDB
        this.authDB = authDB
        this.inviteDB = inviteDB
        this.boom = boom
    }

    static init (groupDB, authDB, inviteDB, boom){
        return new InviteService(groupDB, authDB, inviteDB, boom)
    }

    getInvites(userID){
        const {inviteDB} = this
        const tasks = [
            inviteDB.search(`inviterID:${userID}`),
            inviteDB.search(`inviteeID:${userID}`)
        ]

        return Promise.all(tasks)
            .then(tasksResults => {
                const invites = tasksResults[0].hits.hits
                const pendings = tasksResults[1].hits.hits
                return {
                    "invites": invites,
                    "pendings": pendings
                }
            })
    }

    inviteToGroup(groupID, inviterID, invitee){

        // Needed to add closure of lambda function tasks
        const {authDB, groupDB} = this

        //Load group and serie
        const tasks = [
            groupDB.findByID(groupID),
            authDB.findByID(inviterID),
            authDB.search(`username:${invitee}`)
        ]

        // Called once all tasks have completed
        return Promise.all(tasks)
            .then(tasksResults => {
                const groupData = tasksResults[0]
                const inviterData = tasksResults[1]
                const inviteeDataRaw = tasksResults[2]

                //Check if invitee exists
                if(inviteeDataRaw.hits.total.value == 0){
                    return Promise.reject(this.boom.badRequest(`User '${invitee}' not found!`))
                }
                const inviteeData = inviteeDataRaw.hits.hits[0]

                //Check if the user didn't try to invite itself
                if(inviteeData._source.username === inviterData._source.username)
                    return Promise.reject(this.boom.badRequest(`You can't invite yourself!`))

                const invite = {
                    'inviterID': inviterData._id,
                    'inviter': inviterData._source.username,
                    'inviteeID': inviteeData._id,
                    'invitee': inviteeData._source.username,
                    'groupID' : groupData._id,
                    'group': groupData._source.name
                }

                //Check if invite already exists first then create invite
                return this.inviteDB.search(`inviterID:${inviterID}`)
                    .then(result => {
                        const count = result.hits.hits.filter(inv => JSON.stringify(inv._source) === JSON.stringify(invite))
                        if(count.length > 0)
                            return Promise.reject(this.boom.badRequest(`Already invited user '${invitee}'.`))
                        else
                            return this.inviteDB.create(invite)
                    })
                    .then(() => {
                        return {'message': `Successfully sent invite to user '${invitee}'.`}
                    })
            })
    }

    deleteInvite(userID, inviteID){
        this.inviteDB.findByID(inviteID)
            .then(invite => {
                if(invite._source.inviterID !== userID && invite._source.inviteeID !== userID)
                    return Promise.reject(this.boom.badRequest('Insufficient permissions!'))
                
                return this.inviteDB.delete(inviteID)
            })
            .then(result => {
                return {'message': 'Successfuly deleted invite.'}
            })
    }
}
module.exports = InviteService