'use strict'

class CotaServices {

    constructor(movieAPI, db, boom){
        this.movieAPI = movieAPI
        this.db = db
        this.boom = boom
    }

    static init (movieAPI, db, boom){
        return new CotaServices(movieAPI, db, boom)
    }

    getPopular(){
        return this.movieAPI.getPopularMovies()
            .then(moviesData => {
                const movies = []
                moviesData.results.forEach(element => {
                    movies.push({
                        'id':element.id,
                        'name': element.original_title,
                        'popularity': element.popularity,
                        'vote_average': element.vote_average
                    })
                })
                return movies
            })
            .catch(err => {
                this.boom.internal('Error getting popular movies', err)
            })
    }

    searchSeries(series){
        return this.movieAPI.getSeriesShow(series)
            .then(seriesData => {

                const seriesRes = {
                    'id': seriesData.id,
                    'name': seriesData.name,
                    'popularity': seriesData.popularity,
                    'vote_average': seriesData.vote_average
                }
                return seriesRes
            })
            .catch(err => {
                this.boom.internal('Error searching for series', err)
            })
    }

    createGroup(name, desc, ownerID){
        const group = {
            'owner': ownerID,
            'name': name, 
            'description': desc, 
            'series': []
        }
        return this.db.create(group)
            .then(groupRes => {
                return {
                    '_id': groupRes._id,
                    'name': name,
                    'description': desc,
                    'series': []
                }
            })
            .catch(err => {
                throw this.boom.internal('Failed to create group', err)
            })
    }

    editGroup(id, name, desc, ownerID) {
        const updatedGroup = {}
        if(name) 
            updatedGroup.name = name
        if(desc) 
            updatedGroup.description = desc

        return this.db.findByID(id)
            .then(group => {
                if(group._source.owner != ownerID)
                    return Promise.reject(this.boom.badRequest('Insufficient permissions to edit group'))

                return this.db.update(id, updatedGroup)
            }) 
            .then(groupRes => {      
                return {
                    '_id': groupRes._id,
                    'name': groupRes.get._source.name,
                    'description': groupRes.get._source.description,
                    'series': groupRes.get._source.series
                }
            })
            .catch(err => {
                throw this.boom.internal('Failed to edit group', err)
            })
    }

    deleteGroup(groupID, ownerID){
        return this.db.findByID(groupID)
            .then(group => {
                if(group._source.owner != ownerID)
                    return Promise.reject(this.boom.badRequest('Insufficient permissions to delete group'))

                return this.db.delete(groupID)
            })
            .then(groupRes => {
                return {
                    'message': `Successfully deleted group '${groupRes._id}'`
                }
            })
            .catch(err => {
                throw this.boom.internal('Failed to delete group', err)
            })
    }

    getAllGroups(ownerID){
        return this.db.getAll(ownerID)
            .then(groupData => {
                const groups = []
                groupData.hits.hits.forEach(group => {
                    groups.push({
                        '_id': group._id,
                        'name': group._source.name,
                        'description': group._source.description,
                        'series': group._source.series
                    })
                })
                return groups
            })
            .catch(err => {
                this.boom.internal('Error getting all groups', err)
            })
    }

    getGroup(groupID, ownerID){
        return this.db.findByID(groupID)
            .then(groupData => {
                if(groupData._source.owner != ownerID)
                    return Promise.reject(this.boom.badRequest('Insufficient permissions'))
                    
                const group = {
                    '_id': groupData._id,
                    'name': groupData._source.name,
                    'description': groupData._source.description,
                    'series': groupData._source.series
                }
                return group
            })
            .catch(err => {
                this.boom.internal('Error creating group', err)
            })
    }

    addSeriesToGroup(groupID, series, ownerID){
        // Needed to add closure of lambda function tasks
        const {db, movieAPI} = this

        //Load group and serie
        const tasks = [
            db.findByID(groupID),
            movieAPI.getSeriesShow(series)
        ]

        // Called once all tasks have completed
        return Promise.all(tasks)
            .then(tasksResults => {
                const group = tasksResults[0]._source
                const seriesData = tasksResults[1]

                if(group.owner != ownerID)
                    return Promise.reject(this.boom.badRequest('Insufficient permissions'))

                // Skip if the team is already in group
                if(group.series.some(item => item.name == seriesData.name)) {
                    return  {
                        'message': `The series '${seriesData.id}' is already in group '${groupID}'!`,
                        'result': 'failed'
                    }
                }

                group.series.push({
                        'id': seriesData.id,
                        'name': seriesData.name,
                    })

                return db.update(groupID, {'series': group.series})
                    .then(groupRes => {
                        return {
                            '_id': groupRes._id,
                            'name': groupRes.get._source.name,
                            'description': groupRes.get._source.description,
                            'series': groupRes.get._source.series
                        }
                    })
                    .catch(err => {
                        this.boom.internal('Error updating group', err)
                    })
            })
            .catch(err => {
                this.boom.internal('Error adding series to group', err)
            })
    }

    removeSeriesFromGroup(groupID, series, ownerID){
        return this.db.findByID(groupID)
            .then(groupData => {     
                if(groupData._source.owner != ownerID)
                    return Promise.reject(this.boom.badRequest('Insufficient permissions'))

                const seriesIdx = groupData._source.series.findIndex(item => item.id == series)
                if(seriesIdx === -1)
                    return {'message': `Could not find serie '${series}' in group '${groupID}'!`}
                
                groupData._source.series.splice(seriesIdx, 1)
                return this.db.update(groupID, {'series': groupData._source.series})
                    .then(groupRes => {
                        return {
                            '_id': groupRes._id,
                            'name': groupRes.get._source.name,
                            'description': groupRes.get._source.description,
                            'series': groupRes.get._source.series
                        }
                    })
                    .catch(err => {
                        this.boom.internal('Error updating group', err)
                    })
            })
            .catch(err => {
                this.boom.internal('Error removing series from group', err)
            })
    }

    getSeriesSorted(groupID, min, max, ownerID){
        return this.db.findByID(groupID)
            .then(groupData => {
                if(groupData._source.owner != ownerID)
                    return Promise.reject(this.boom.badRequest('Insufficient permissions'))

                // Needed to add closure of lambda function tasks
                const {movieAPI} = this

                //Request all series from API
                const tasks = []
                groupData._source.series.forEach(element => tasks.push(movieAPI.getSeriesShow(element.id)))

                // Called once all tasks have completed
                return Promise.all(tasks)
                    .then(tasksResults => {
                        let series = []
                        tasksResults.forEach(element => series.push({
                            'id': element.id,
                            'name': element.name,
                            'popularity': element.popularity,
                            'vote_average': element.vote_average
                        }))

                        series = series
                            .sort((a, b) => (a.vote_average < b.vote_average) ? 1 : -1)
                            .filter(item => ((parseFloat(max) > item.vote_average) && (parseFloat(min) < item.vote_average)))

                        return series
                    })
                    .catch(err => {
                        this.boom.internal('Error getting series', err)
                    })
            })
            .catch(err => {
                this.boom.internal('Error getting series sorted', err)
            })
    }

    updateSeriesRating(groupID, seriesID, rating, ownerID){
        return this.db.findByID(groupID)
            .then(group => {
                if(group._source.owner != ownerID)
                    return Promise.reject(this.boom.badRequest('Insufficient permissions to edit group'))

                const newSeries = group._source.series.map(serie => {
                    if(serie.id != seriesID)
                        return serie
                    serie.rating = rating
                    return serie
                })
                const newGroup = {
                    'series': newSeries
                }
                return this.db.update(groupID, newGroup)
            })
            .then(group => {
                let total = 0;
                let numberOfRatings = 0;
                group.get._source.series.forEach(serie => {
                    if(serie.rating){
                        total += serie.rating
                        numberOfRatings++;
                    }
                })
                const average = total/numberOfRatings
                return {
                    'average': average
                }
            })
            .catch(err => {
                this.boom.internal('Error getting series sorted', err)
            })
    }
}
module.exports = CotaServices