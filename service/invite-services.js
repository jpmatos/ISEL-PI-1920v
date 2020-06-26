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

    inviteToGroup(groupID, inviterID, invitee){

        // Needed to add closure of lambda function tasks
        const {authDB, groupDB} = this

        //Load group and serie
        const tasks = [
            authDB.search(`username:${invitee}`),
            groupDB.findByID(groupID)
        ]

        // Called once all tasks have completed
        return Promise.all(tasks)
            .then(tasksResults => {
                const inviteeDataRaw = tasksResults[0]
                const groupData = tasksResults[1]

                //Check if invitee exists
                if(inviteeDataRaw.hits.total.value == 0){
                    return Promise.reject(this.boom.badRequest(`User '${invitee}' not found!`))
                }
                const inviteeData = inviteeDataRaw.hits.hits[0]

                const invite = {
                    'inviterID': inviterID,
                    'inviteeID': inviteeData._id,
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
}
module.exports = InviteService