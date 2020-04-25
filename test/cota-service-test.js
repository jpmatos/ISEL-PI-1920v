'use strict'

//Load env variables
const env = require('../env.json')
Object.assign(process.env, env)

//See if mock API was specified
let cotaServicesPath
if(env.MOCHA_API === 'mock') {
    console.debug('Running Tests with mock API.')
    cotaServicesPath = '../service/cota-services'
}
else {
    console.debug('Running Tests with mock Service.')
    cotaServicesPath = '../service/cota-services-mock'
}


const expect = require('chai').expect
const movieDataAPI = require('../data/movie-database-data-mock').init()
const cotaDB = require('../data/cota-db').init()
const cotaServices = require(cotaServicesPath).init(movieDataAPI, cotaDB)

describe('CotaService test API for Group', () => {
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

    it('Should create a group', done => {
        cotaServices.createGroup(groupToAdd.name, groupToAdd.description, (err, res) => {
            expect(res._id).to.be.a('number')
            expect(res.name).to.eql(groupToAdd.name)
            expect(res.description).to.eql(groupToAdd.description)
            expect(res).to.have.a.property('series')
            groupIDs[0] = res._id
            done()
        })
    })

    it('Should edit a group', done => {
        cotaServices.createGroup(groupToAdd.name, groupToAdd.description, (err, res) => {
            const groupID = res._id
            groupIDs[0] = groupID
            cotaServices.editGroup(groupID, groupEdited.name, groupEdited.description, (err, res) => {
                expect(res._id).to.eql(groupID)
                expect(res.name).to.eql(groupEdited.name)
                expect(res.description).to.eql(groupEdited.description)
                expect(res).to.have.a.property('series')
                done()
            })
        })
    })

    it('Should add a serie to a group', done => {
        cotaServices.createGroup(groupToAdd.name, groupToAdd.description, (err, res) => {
            groupIDs[0] = res._id
            cotaServices.addSeriesToGroup(groupIDs[0], serieToAdd.id, (err, res) => {
                const series = res.series[res.series.length - 1]
                expect(series.id).to.eql(serieToAdd.id)
                expect(series.name).to.be.a('string')
                done()
            })
        })
    })

    it('Should get all groups', done => {
        cotaServices.createGroup(groupToAdd.name, groupToAdd.description, (err, res) => {
            groupIDs[0] = res._id
            cotaServices.createGroup(groupToAdd.name, groupToAdd.description, (err, res) => {
                groupIDs[1] = res._id
                cotaServices.createGroup(groupToAdd.name, groupToAdd.description, (err, res) => {
                    groupIDs[2] = res._id
                    cotaServices.getAllGroups((err, res) => {
                        res.forEach(function(group) {
                            expect(group._id).to.be.a('number')
                            expect(group.name).to.exist
                            expect(group.description).to.exist
                            expect(group.series).to.exist
                        })
                        done()
                    })
                })
            })
        })
    })

    it('Should get a group', done => {
        cotaServices.createGroup(groupToAdd.name, groupToAdd.description, (err, res) => {
            groupIDs[0] = res._id
            cotaServices.getGroup(groupIDs[0], (err, res) => {
                expect(res._id).to.be.a('number')
                expect(res.name).to.exist
                expect(res.description).to.exist
                expect(res).to.have.a.property('series')
                done()
            })
        })
    })

    it('Should get sorted and filtered series for a group', done => {
        cotaServices.createGroup(groupToAdd.name, groupToAdd.description, (err, res) => {
            const groupID = res._id
            groupIDs[0] = groupID
            cotaServices.addSeriesToGroup(groupID, serieToAdd.id, (err, res) => {
                cotaServices.getSeriesSorted(groupID, min, max, (err, res) => {
                    let lastVote = -1
                    res.forEach(function(series) {
                        if(lastVote == -1)
                            lastVote = series.vote_average
                        expect(series.id).to.be.a('number')
                        expect(series.name).to.be.a('string')
                        expect(series.popularity).to.be.a('number')
                        expect(series.vote_average).to.be.at.most(lastVote)
                        expect(series.vote_average).to.be.at.most(parseFloat(max))
                        expect(series.vote_average).to.be.at.least(parseFloat(min))
                    })
                    done()
                })
            })
        })
    })

    it('Should remove a series from a group', done => {
        cotaServices.createGroup(groupToAdd.name, groupToAdd.description, (err, res) => {
            const groupID = res._id
            groupIDs[0] = groupID
            cotaServices.addSeriesToGroup(groupID, serieToAdd.id, (err, res) => {
                cotaServices.removeSeriesFromGroup(groupID, serieToAdd.id, (err, res) => {
                    res.series.forEach(function(series) {
                        expect(series.id).to.not.eql(serieToAdd.id)
                    })
                    done()
                })
            })
        })
    })
})