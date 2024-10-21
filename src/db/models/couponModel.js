const Sequelize = require('sequelize')
const  {sequelize} = require('../index')
const constant = require('../../shared/constants')

const couponModel = sequelize.define('coupon', {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    coupon_code: {
      type: Sequelize.STRING({length:200}),
      notNull: true,
      allowNull: false,
      unique: true
    },
    type: {
      type: Sequelize.ENUM(Object.values(constant.COUPON_TYPE)),
      notNull: true,
      allowNull: false
    },
    product_id:{
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      notNull: false
    },
    discount: {
      type: Sequelize.DECIMAL(15, 2),
      defaultValue: 0
    },
    discount_max_amount: {
      type: Sequelize.DECIMAL(15, 2),
      defaultValue:0
    },
    threshold :{
      type: Sequelize.DECIMAL(15, 2),
      notNull: false,
      allowNull: true
    },
    expiry_date: {
        type: Sequelize.DATE()
    },
    buy_array:{
      type: Sequelize.STRING(255),
      notNull: false,
      allowNull: true
    },
    buy_threshold:{
      type: Sequelize.INTEGER.UNSIGNED,
      notNull: false,
      allowNull: true
    },
    get_array:{
      type: Sequelize.STRING(255),
      notNull: false,
      allowNull: true
    },
    get_quantity:{
      type: Sequelize.INTEGER.UNSIGNED,
      notNull: false,
      allowNull: true
    },
    repition_limit: {
      type: Sequelize.INTEGER.UNSIGNED,
      notNull: false,
      allowNull: true
    },
    is_active: {
      type: Sequelize.ENUM('1', '0'),
      defaultValue: '1'
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('now')
    },
    modified_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('now')
    },
    created_by: {
        type: Sequelize.INTEGER.UNSIGNED
      },
    modified_by: {
      type: Sequelize.INTEGER.UNSIGNED,
      notNull: false,
      allowNull: true
    }
  }, {
    freezeTableName: true,
    timestamps: false,

    hooks:{
        beforeUpdate:(modelInstance, options) =>{
            modelInstance.modified_at = Sequelize.fn('now')
        }
      }
  },
)

  module.exports = {
    couponModel
  }
