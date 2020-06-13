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
            .catch(err => {
                throw this.boom.internal('Failed to verify user', err)
            })
    }

    registerUser(username, password){
        return this.existsUser(username)
            .then(exists => {
                if(!exists){
                    return this.createUser(username, password)
                }
                return Promise.reject(this.boom.badRequest('A user with the same username already exists'))
            })
            .catch(err => {
                throw this.boom.internal('Failed to register user', err)
            })
    }

    createUser(username, password){
        return this.db.create({
            'username': username,
            'password': password
        })
        .then(result => {
            return {
                '_id': result._id,
                'username': username
            }
        })
        .catch(err => {
            throw this.boom.internal('Failed to create user', err)
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
            .catch(err => {
                throw this.boom.internal('Failed check if user exists', err)
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
            .catch(err => {
                throw this.boom.internal('Failed to get user data', err)
            })
    }

    getUserById(id){
        return this.db.findByID(id)
            .then(result => ({
                '_id': result._id,
                ...result._source
            }))
            .catch(err => {
                throw this.boom.internal('Failed to get user by Id', err)
            })
    }

    deleteUser(id){
        return this.db.delete(id)
            .then(result => {
                return {
                    'message': `Successfully deleted user`
                }
            })
            .catch(err => {
                throw this.boom.internal('Failed to delete user', err)
            })
    }
}
module.exports = AuthServices