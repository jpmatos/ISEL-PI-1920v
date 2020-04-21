'use strict'

module.exports = class cotaServices {

    constructor(movieAPI, db){
        this.movieAPI = movieAPI
        this.db = db
    }

    static init (movieAPI, db){
        return new cotaServices(movieAPI, db)
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
            });
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

        this.db.create(group, (err, groupData) => {
            if(err) 
                return cb(err)
            group._id = groupData._id
            cb(null, group)
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

        this.db.update(id, updatedGroup, (err, groupData) => {
            if(err) 
                return cb(err)            
            cb(null, groupData)
        })
    }

    getAllGroups(cb){
        const groups = []
        this.db.getAll((err, groupData) => {
            if(err)
                return cb(err)
            groupData.forEach(group => {
                groups.push({
                    '_id': group._id,
                    'name': group.name,
                    'description': group.description,
                    'series': group.series.length
                })
            })
            cb(null, groups)
        })
    }

    getGroup(groupID, cb){
        this.db.findByID(groupID, (err, groupData) => {
            if(err)
                return cb(err)
            cb(null, groupData)
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

            const group = tasksResults[0]
            const seriesData = tasksResults[1]

            // Skip if the team is already in group
            if(group.series.some(item => item.name == seriesData.name)) {
                return cb(null, {'message': `The series '${seriesData.id}' is already in group '${groupID}'!`})
            }

            group.series.push({
                    'id': seriesData.id,
                    'name': seriesData.name,
                    'popularity': seriesData.popularity,
                    'vote_average': seriesData.vote_average
                })

            db.update(groupID, {'series': group.series}, (err, groupRes) => {
                if(err)
                    return cb(err)
                cb(null, groupRes)
            })
        })
    }

    removeSeriesFromGroup(groupID, series, cb){
        this.db.findByID(groupID, (err, groupData) => {
            if(err)
                return cb(err)
            
            const seriesIdx = groupData.series.findIndex(item => item.id == series)
            if(seriesIdx === -1)
                return cb(null, {'message': `Could not find serie '${series}' in group '${groupID}'!`})
            
            groupData.series.splice(seriesIdx, 1)
            this.db.update(groupID, {'series': groupData.series}, (err, groupRes) => {
                if(err)
                    return cb(err)
                cb(null, groupRes)
            })
        })
    }

    getSeriesSorted(groupID, min, max, cb){
        this.db.findByID(groupID, (err, groupData) => {
            if(err)
                return cb(err)

            let series = groupData.series
                .sort((a, b) => (a.vote_average < b.vote_average) ? 1 : -1)
                .filter(item => ((parseFloat(max) > item.vote_average) && (parseFloat(min) < item.vote_average)))

            cb(null, series)
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