'use strict'

class CotaServices {

    constructor(movieAPI, db){
        this.movieAPI = movieAPI
        this.db = db
    }

    static init (movieAPI, db){
        return new CotaServices(movieAPI, db)
    }

    getPopular(cb){
        this.movieAPI.getPopularMovies((err, moviesData) => {
            const movies = []
            if(err) 
                return cb(err)
            moviesData.results.forEach(element => {
                movies.push({
                    'id':element.id,
                    'name': element.original_title,
                    'popularity': element.popularity,
                    'vote_average': element.vote_average
                })
            })
            cb(null, movies)
        })
    }

    searchSeries(series, cb){
        this.movieAPI.getSeriesShow(series, (err, seriesData) => {
            if(err) 
                return cb(err)

            const seriesRes = {
                'id': seriesData.id,
                'name': seriesData.name,
                'popularity': seriesData.popularity,
                'vote_average': seriesData.vote_average
            }
            cb(null, seriesRes)
        })
    }

    createGroup(name, desc, cb){
        if(!name || !desc)
            return cb(null, {'message': 'Must provide name and description to create a group'})
        if(!/^[A-Za-z0-9]+$/.test(name) || !/^[A-Za-z0-9]+$/.test(desc))
            return cb(null, {'message': 'Must provide name and description with no special chars'})

        const group = {'name': name, 'description': desc, 'series': []}

        this.db.create(group, (err, groupRes) => {
            if(err) 
                return cb(err)
                
            cb(null, {
                '_id': groupRes._id,
                'name': name,
                'description': desc,
                'series': []
            })
        })
    }

    editGroup(id, name, desc, cb) {
        if(!name && !desc)
            return cb(null, {'message': 'Must provide name or description to update a group'})
        if(!/^[A-Za-z0-9]+$/.test(name) || !/^[A-Za-z0-9]+$/.test(desc)) {
            return cb(null, {'message': 'Must provide name and description with no special chars'})
        }

        const updatedGroup = {}
        if(name) 
            updatedGroup.name = name
        if(desc) 
            updatedGroup.description = desc

        this.db.update(id, updatedGroup, (err, groupRes) => {
            if(err) 
                return cb(err)            
            cb(null, {
                '_id': groupRes._id,
                'name': groupRes.get._source.name,
                'description': groupRes.get._source.description,
                'series': groupRes.get._source.series
            })
        })
    }

    getAllGroups(cb){
        this.db.getAll((err, groupData) => {
            if(err)
                return cb(err)

            groupData = groupData.hits.hits

            const groups = []
            groupData.forEach(group => {
                groups.push({
                    '_id': group._id,
                    'name': group._source.name,
                    'description': group._source.description,
                    'series': group._source.series
                })
            })
            cb(null, groups)
        })
    }

    getGroup(groupID, cb){
        this.db.findByID(groupID, (err, groupData) => {
            if(err)
                return cb(err)

            const group = {
                '_id': groupData._id,
                'name': groupData._source.name,
                'description': groupData._source.description,
                'series': groupData._source.series
            }

            cb(null, group)
        })
    }

    addSeriesToGroup(groupID, series, cb){
        // Needed to add closure of lambda function tasks
        const {db, movieAPI} = this

        //Load group and serie
        const tasks = [
            taskCB => db.findByID(groupID, taskCB),
            taskCB => movieAPI.getSeriesShow(series, taskCB)
        ]

        // Called once all tasks have completed
        this.constructor.parallel(tasks, (err, tasksResults) => {
            if(err)
                return cb(err)

            const group = tasksResults[0]._source
            const seriesData = tasksResults[1]

            // Skip if the team is already in group
            if(group.series.some(item => item.name == seriesData.name)) {
                return cb(null, {
                    'message': `The series '${seriesData.id}' is already in group '${groupID}'!`,
                    'result': 'failed'
                })
            }

            group.series.push({
                    'id': seriesData.id,
                    'name': seriesData.name,
                })

            db.update(groupID, {'series': group.series}, (err, groupRes) => {
                if(err)
                    return cb(err)
                cb(null, {
                    '_id': groupRes._id,
                    'name': groupRes.get._source.name,
                    'description': groupRes.get._source.description,
                    'series': groupRes.get._source.series
                })
            })
        })
    }

    removeSeriesFromGroup(groupID, series, cb){
        this.db.findByID(groupID, (err, groupData) => {
            if(err)
                return cb(err)
            
            const seriesIdx = groupData._source.series.findIndex(item => item.id == series)
            if(seriesIdx === -1)
                return cb(null, {'message': `Could not find serie '${series}' in group '${groupID}'!`})
            
            groupData._source.series.splice(seriesIdx, 1)
            this.db.update(groupID, {'series': groupData._source.series}, (err, groupRes) => {
                if(err)
                    return cb(err)
                cb(null, {
                    '_id': groupRes._id,
                    'name': groupRes.get._source.name,
                    'description': groupRes.get._source.description,
                    'series': groupRes.get._source.series
                })
            })
        })
    }

    getSeriesSorted(groupID, min, max, cb){
        this.db.findByID(groupID, (err, groupData) => {
            if(err)
                return cb(err)

        // Needed to add closure of lambda function tasks
        const {movieAPI} = this

        //Request all series from API
        const tasks = []
        groupData._source.series.forEach(element => tasks.push(taskCB => movieAPI.getSeriesShow(element.id, taskCB)))

        // Called once all tasks have completed
        this.constructor.parallel(tasks, (err, tasksResults) => {
            if(err)
                return cb(err)

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

            cb(null, series)
            })
        })
    }

    static parallel(tasks, callback) {
        const results = []
        let counter = 0
    
        tasks.forEach((task, index) => {
            task((err, result) => {
                if(err)
                    return callback(err)
    
                counter++
                results[index] = result
    
                if(counter == tasks.length)
                    callback(null, results)
            })
        })
    }
}
module.exports = CotaServices