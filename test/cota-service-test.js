'use strict'

//Load env variables
const env = require('../env.json')
Object.assign(process.env, env)

//See if mock API is set
let cotaServicesPath
if(env.MOCHA_API === 'mock') {
    console.debug('Running Tests with mock API')
    cotaServicesPath = '../service/cota-services'
}
else {
    console.debug('Running Tests with mock Service')
    cotaServicesPath = '../service/cota-services-mock'
}

//See if mock DB is set
let dbPath
if(env.MOCHA_DB === 'mock'){
    console.debug('Running Tests with mock DB')
    dbPath = '../data/cota-db-mock'
}
else {
    console.debug('Running Tests with Elasticseach DB')
    dbPath = '../data/cota-db'
}


const nodefetch = require('node-fetch')
const expect = require('chai').expect

const movieDataAPI = require('../data/movie-database-data-mock').init()
const cotaDB = require(dbPath).init(process.env.ES_BASE_URL, process.env.ES_GROUPS_INDEX, nodefetch)
const cotaServices = require(cotaServicesPath).init(movieDataAPI, cotaDB)

describe('CotaService test API for Group', () => {
    const ownerID = "TESTID123"
    const groupToAdd = {
        'name': 'Name',
        'description': 'Description'
    }
    const groupEdited = {
        'name': 'NameEdited',
        'description': 'DescriptionEdited'
    }
    const serieToAdd = {
        'id': 4607,
        'name': 'Lost',
        'popularity': 59.299,
        'vote_average': 7.8
    }
    const min = 7.9
    const max = 8.4
    let groupIDs = []

    after(() => {
        cotaDB.resetID()
    })

    afterEach(() => {
        groupIDs = [] // clean
    })

    it('Should create a group', () => {
        return cotaServices
            .createGroup(groupToAdd.name, groupToAdd.description, ownerID)
            .then(res => {
                expect(res._id).to.be.a('string')
                expect(res.name).to.eql(groupToAdd.name)
                expect(res.description).to.eql(groupToAdd.description)
                expect(res).to.have.a.property('series')
                groupIDs[0] = res._id
            })
    })

    it('Should edit a group', () => {
        return cotaServices
            .createGroup(groupToAdd.name, groupToAdd.description, ownerID)
            .then(res => {
                const groupID = res._id
                groupIDs[0] = groupID
                return Promise.all([
                    groupID,
                    groupEdited.name,
                    groupEdited.description,
                    cotaServices.editGroup(groupID, groupEdited.name, groupEdited.description, ownerID)
                ])
            })
            .then(([groupID, name, description, res]) => {
                expect(res._id).to.eql(groupID)
                expect(res.name).to.eql(name)
                expect(res.description).to.eql(description)
                expect(res).to.have.a.property('series')
            })
    })

    it('Should add a serie to a group', () => {
        return cotaServices
            .createGroup(groupToAdd.name, groupToAdd.description, ownerID)
            .then(res => {
                groupIDs[0] = res._id
                return cotaServices.addSeriesToGroup(groupIDs[0], serieToAdd.id, ownerID)
            })
            .then(res => {
                const series = res.series[res.series.length - 1]
                expect(series.id).to.eql(serieToAdd.id)
                expect(series.name).to.be.a('string')
            })
    })

    it('Should get all groups', () => {
        return cotaServices
            .createGroup(groupToAdd.name, groupToAdd.description, ownerID)
            .then(res => {
                groupIDs[0] = res._id
                return cotaServices.createGroup(groupToAdd.name, groupToAdd.description, ownerID)
                
            })
            .then(res => {
                groupIDs[1] = res._id
                return cotaServices.createGroup(groupToAdd.name, groupToAdd.description, ownerID)
            })
            .then(res => {
                groupIDs[2] = res._id
                return cotaServices.getAllGroups(ownerID)
            })
            .then(res => {
                res.forEach(group => {
                    expect(group._id).to.be.a('string')
                    expect(group.name).to.exist
                    expect(group.description).to.exist
                    expect(group.series).to.exist
                })
            })
    })

    it('Should get a group', () => {
        return cotaServices
            .createGroup(groupToAdd.name, groupToAdd.description, ownerID)
            .then(res => {
                groupIDs[0] = res._id
                return cotaServices.getGroup(groupIDs[0], ownerID)
            })
            .then(res => {
                expect(res._id).to.be.a('string')
                expect(res.name).to.exist
                expect(res.description).to.exist
                expect(res).to.have.a.property('series')
            })
    })

    it('Should get sorted and filtered series for a group', () => {
        return cotaServices
            .createGroup(groupToAdd.name, groupToAdd.description, ownerID)
            .then(res => {
                const groupID = res._id
                groupIDs[0] = groupID
                return Promise.all([
                    groupID, 
                    cotaServices.addSeriesToGroup(groupID, serieToAdd.id, ownerID)
                ])
            })
            .then(([groupID, res]) => {
                return cotaServices.getSeriesSorted(groupID, min, max, ownerID)
            })
            .then(res => {
                let lastVote = -1
                res.forEach(series => {
                    if(lastVote == -1)
                        lastVote = series.vote_average
                    expect(series.id).to.be.a('number')
                    expect(series.name).to.be.a('string')
                    expect(series.popularity).to.be.a('number')
                    expect(series.vote_average).to.be.at.most(lastVote)
                    expect(series.vote_average).to.be.at.most(parseFloat(max))
                    expect(series.vote_average).to.be.at.least(parseFloat(min))
                })
            })
    })

    it('Should remove a series from a group', () => {
        return cotaServices.createGroup(groupToAdd.name, groupToAdd.description, ownerID)
        .then(res => {
            const groupID = res._id
            groupIDs[0] = groupID
            return Promise.all([
                groupID,
                cotaServices.addSeriesToGroup(groupID, serieToAdd.id, ownerID)
            ])
        })
        .then(([groupID, res]) => {
            return cotaServices.removeSeriesFromGroup(groupID, serieToAdd.id, ownerID)
        })
        .then(res => {
            res.series.forEach(series => {
                expect(series.id).to.not.eql(serieToAdd.id)
            })
        })
    })
})