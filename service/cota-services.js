'use strict'

class CotaServices {

    constructor(movieAPI, db){
        this.movieAPI = movieAPI
        this.db = db
    }

    static init (movieAPI, db){
        return new CotaServices(movieAPI, db)
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
                console.debug(err)
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
                console.debug(err)
            })
    }

    createGroup(name, desc){
        const group = {'name': name, 'description': desc, 'series': []}
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
                console.debug(err)
            })
    }

    editGroup(id, name, desc) {
        const updatedGroup = {}
        if(name) 
            updatedGroup.name = name
        if(desc) 
            updatedGroup.description = desc

        return this.db.update(id, updatedGroup)
            .then(groupRes => {      
                return {
                    '_id': groupRes._id,
                    'name': groupRes.get._source.name,
                    'description': groupRes.get._source.description,
                    'series': groupRes.get._source.series
                }
            })
            .catch(err => {
                console.debug(err)
            })
    }

    deleteGroup(groupID){
        return this.db.delete(groupID)
            .then(groupRes => {
                return {
                    'message': `Sucessfully deleted group '${groupRes._id}'`
                }
            })
            .catch(err => {
                console.debug(err)
            })
    }

    getAllGroups(){
        return this.db.getAll()
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
                console.debug(err)
            })
    }

    getGroup(groupID){
        return this.db.findByID(groupID)
            .then(groupData => {
                const group = {
                    '_id': groupData._id,
                    'name': groupData._source.name,
                    'description': groupData._source.description,
                    'series': groupData._source.series
                }
                return group
            })
            .catch(err => {
                console.debug(err)
            })
    }

    addSeriesToGroup(groupID, series){
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
                        console.debug(err)
                    })
            })
            .catch(err => {
                console.debug(err)
            })
    }

    removeSeriesFromGroup(groupID, series){
        return this.db.findByID(groupID)
            .then(groupData => {                
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
                        console.debug(err)
                    })
            })
            .catch(err => {
                console.debug(err)
            })
    }

    getSeriesSorted(groupID, min, max){
        return this.db.findByID(groupID)
            .then(groupData => {
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
                        console.debug(err)
                    })
            })
            .catch(err => {
                console.debug(err)
            })
    }
}
module.exports = CotaServices