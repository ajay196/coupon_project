'use strict'

const Sequelize = require('sequelize')
let env = process.env.NODE_ENV || 'development'
const config = require('./config/config.json')
const currentEnv = config[env]

let db = {}

// database connection
const sequelize = new Sequelize(currentEnv.database, currentEnv.username, currentEnv.password, currentEnv)
try{
    sequelize.authenticate()
    console.log('database connection stablised')
}catch(err){
    console.log(`database connection failed, error: ${err}`)
}


db = { Sequelize, sequelize }
module.exports = db
