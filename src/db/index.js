'use strict'

const Sequelize = require('sequelize')
const env = process.env.NODE_ENV || 'development'
const config = require('./config/config.json')
const currentEnv = config[env]
let db = {}

// database connection
const sequelize = new Sequelize(currentEnv.database, currentEnv.username, currentEnv.password, currentEnv)
sequelize.authenticate()
    .then(()=>{console.log('database connection stablised')})
    .catch((err)=>{ console.log(`database connection failed, error: ${err}`)})


db = { Sequelize, sequelize }
module.exports = db
