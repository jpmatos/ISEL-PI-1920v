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
                    'popularity':element.popularity,
                    'id':element.id,
                    'title': element.original_title
                })
            });
            cb(null, movies)
        })
    }

    searchSerie(serie, cb){
        this.movieAPI.getSerieShow(serie, (err, seriesData) => {
            if(err) 
                return cb(err)
            if(seriesData.results.length === 0)
                return cb(null, {'message': `Could not find serie '${serie}'!`})

            const series = []
            seriesData.results.forEach(element => {
                series.push({
                    'id': element.id,
                    'name': element.name,
                    'popularity': element.popularity
                })
            })
            cb(null, series)
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

    addSerieToGroup(groupID, serie, cb){
        // Needed to add closure of lambda function tasks
        const {db, movieAPI} = this

        //Load group and serie
        const tasks = [
            taskCB => db.findByID(groupID, taskCB),
            taskCB => movieAPI.getSerieShow(serie, taskCB)
        ]

        // Called once all tasks have completed
        this.constructor.parallel(tasks, (err, tasksResults) => {
            if(err)
                return cb(err)

            const group = tasksResults[0]
            const serieData = tasksResults[1]

            // Skip if the team is already in group
            if(group.series.some(item => item.name == serieData.results[0].name)) {
                return cb(null, {'message': `The serie '${serieData.results[0].name}' is already in group '${groupID}'!`})
            }

            group.series.push({
                    'id': serieData.results[0].id,
                    'name': serieData.results[0].name,
                    'popularity': serieData.results[0].popularity
                })

            db.update(groupID, {'series': group.series}, (err, groupRes) => {
                if(err)
                    return cb(err)
                cb(null, groupRes)
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