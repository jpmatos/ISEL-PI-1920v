'use strict'

class AuthServices{
    constructor(db, boom){
        this.db = db
        this.boom = boom
    }

    static init(db, boom){
        return new AuthServices(db, boom)
    }

    verify(username, password){
        return this.getUserData(username)
            .catch(err => {
                if(err.statusCode == 404)
                    return false // User does not exist
                throw this.boom.internal('Failed to load user from the database', err)
            })
            .then(user => {
                if (user == null)
                    return false
                return user.password == password
            })
    }

    registerUser(username, password){
        return this.existsUser(username)
            .catch(err => {
                throw this.boom.internal('Failed to load user data from the database', err)
            })
            .then(exists => {
                if(!exists){
                    return this.createUser(username, password)
                }
                return Promise.reject(this.boom.badRequest('A user with the same username already exists'))
            })
    }

    createUser(username, password){
        return this.db.create({
            'username': username,
            'password': password
        })
        .catch(err => {
            throw this.boom.internal('Error creating user', err)
        })
        .then(result => {
            return {
                '_id': result._id,
                'username': username
            }
        })
    }

    existsUser(username){
        return this.getUserData(username)
            .then(res => res instanceof Object)
            .catch(err => {
                if(err.statusCode == 404)
                    return false
                throw err
            })
    }

    getUserData(username){
        return this.db.search(`username:${username}`)
            .then(result => {
                if(result.hits.total.value == 0){
                    return null
                }
                const userData = result.hits.hits[0]
                return {
                    '_id': userData._id,
                    ...userData._source
                }
            })
    }

    getUserById(id){
        return this.db.findByID(id)
            .then(result => ({
                '_id': result._id,
                ...result._source
            }))
    }
}
module.exports = AuthServices