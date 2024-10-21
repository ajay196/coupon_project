const {couponModel} = require('../db/models/couponModel')
const { successHandler, errorHandler } = require('../shared/responsehandler')
const {COUPON_TYPE} = require('../shared/constants')
const { Op, Sequelize } = require('sequelize')
const { json } = require('express')

async function create(req, res, next){
    try{
        const body = req.body
        const coupon_details = body.details
        if (!Object.keys(COUPON_TYPE).includes(body.type)){
            throw Error("invalid coupon type")
        }
        coupon_details.type = COUPON_TYPE[body.type]
        if(coupon_details.type == COUPON_TYPE.bxgy){

            buy_products = coupon_details.buy_products.map((data)=>{return data.product_id})
            get_products = coupon_details.get_products.map((data)=>{return data.product_id})
            coupon_details.buy_threshold = coupon_details.buy_products.reduce((accumulator, item) => {
                return accumulator + item.quantity
            }, 0)
            coupon_details.get_quantity = coupon_details.get_products.reduce((accumulator, item) => {
                return accumulator + item.quantity
            }, 0)
            coupon_details.buy_array = JSON.stringify(buy_products)
            coupon_details.get_array = JSON.stringify(get_products)
        }

        const coupon_data = await couponModel.create(coupon_details)
        return res.send(successHandler("coupon created sucessfully", coupon_data))
    }catch(err){
        return res.send(errorHandler(err?.message))
    }
}

async function list(req, res, next){
    try{
        const limit = parseInt(req.query.limit) || 10
        const page = parseInt(req.query.page) || 1
        const offSet = limit*(page-1)
        const coupon_data = await couponModel.findAndCountAll({
            limit: limit,
            offSet: offSet,
            raw: true
        })
        return res.send(successHandler("coupon fetch sucessfully", coupon_data.rows, coupon_data.count))
    }catch(err){
        return res.send(errorHandler(err?.message))
    }
}

async function getCoupon(req, res, next){
    try{
        const coupon_id = req.params.couponId
        const coupon_data = await couponModel.findByPk(coupon_id)
        if(!coupon_data){
            throw Error("coupon not found")
        }
        return res.send(successHandler("coupon fetch sucessfully", coupon_data))
    }catch(err){
        return res.send(errorHandler(err?.message))
    }
}

async function deleteCoupon(req, res, next){
    try{
        const coupon_id = req.params.couponId
        const coupon_data = await couponModel.findByPk(coupon_id)
        if(!coupon_data){
            throw Error("coupon not found")
        }
        coupon_data.is_active ='0'
        coupon_data.save()

        return res.send(successHandler("coupon delete sucessfully", coupon_data))
    }catch(err){
        return res.send(errorHandler(err?.message))
    }
}

async function applicableCoupon(req, res, next){
    try{
        const body = req.body
        const cart_items = body.cart.items
        const product_ids = cart_items.map((item)=>{return item.product_id})
        let cart_value=0
        cart_items.forEach((item)=>{cart_value+=(item.price*item.quantity)})
        let applicableCoupon = []
        // get all the coupon for cart value and product wise
        const cart_wise_coupon = await couponModel.findAll({
            attributes: [['id', 'coupon_id'], 'type', 'discount'],
            where:{
                is_active: '1',
                [Op.or]:{
                    product_id:{
                        [Op.in]: product_ids
                    },
                    threshold:{
                        [Op.lte]: cart_value
                    }
                },
                expiry_date:{
                    [Op.gt]: Sequelize.fn('now')
                }
            },
            raw: true
        })
        cart_wise_coupon.forEach((data)=>{
            data.discount = (cart_value*data.discount)/100
        })
        // console.log(cart_wise_coupon)

        // buyxgety coupon
        const buyx_coupon = await couponModel.findAll({
            where:{
                type: COUPON_TYPE['bxgy']
            },
            raw: true
        })
        let buyxgetycoupon = []
        for (let coupon of buyx_coupon) {
           const result = applySingleCoupon(cart_items, coupon)

           if(result.isCouponApplicable){
                buyxgetycoupon.push(result.couponDetail)
           }
        }
        applicableCoupon = [...cart_wise_coupon, ...buyxgetycoupon]
        const response ={
            "applicable_coupons":applicableCoupon
        }
        return res.send(successHandler("applicable coupon fetch sucessfully", response))
    }catch(err){
        return res.send(errorHandler(err?.message))
    }
}

async function applyCoupon(req, res, next){
    try{
        const coupon_id = req.params.couponId
        const body = req.body
        const cart_items = body.cart.items
        const coupon_data = await couponModel.findOne({
            where:{
                id:coupon_id,
                is_active:'1',
                expiry_date:{
                    [Op.gt]: Sequelize.fn('now')
                }
            }
        })
        if(!coupon_data){
            throw Error("Invalid coupon Or coupon expired")
        }

        let cart_price =0
        cart_items.forEach((item)=>{
            cart_price+=(item.price*item.quantity)
        })
        let totaldiscount = 0
        // cart wise coupon
        if(coupon_data.type== COUPON_TYPE['cart-wise']){
            cart_items.forEach((data)=>{
                data.total_discount =0
            })
            totaldiscount = (cart_price*coupon_data.discount)/100
        // product wise coupon
        }else if(coupon_data.type== COUPON_TYPE['product-wise']){
            cart_items.forEach((data)=>{
                if(data.product_id==coupon_data.product_id){
                    data.total_discount = (data.price*coupon_data.discount)/100
                    totaldiscount= data.total_discount
                }else{
                    data.total_discount =0
                }
            })
        // buyxgety coupon
        }else if(coupon_data.type== COUPON_TYPE['bxgy']){
            get_product = JSON.parse(coupon_data.get_product)
            cart_items.forEach((cart_data)=>{
                if(get_product.includes(cart_data.product_id)){
                    cart_data.total_discount = (cart_data.price*coupon_data.get_quantity)
                    cart_data.quantity += data.quantity
                    totaldiscount+= cart_data.total_discount
                }else{
                    cart_data.total_discount =0
                }
            })
        }else{
            throw Error("invalid coupon type")
        }

        const responseObj = {
            "updated_cart":{
                "items": cart_items,
                "total_price": cart_price,
                "total_discount": totaldiscount,
                "final_price": cart_price-totaldiscount
            }
        }

        return res.send(successHandler("coupon apply sucessfully", responseObj))
    }catch(err){
        return res.send(errorHandler(err?.message))
    }
}

function applySingleCoupon(cart, coupon) {
    const buyArray = JSON.parse(coupon.buy_array)
    const getArray = JSON.parse(coupon.get_array)
    const buyThreshold = coupon.buy_threshold
    const getQuantity = coupon.get_quantity
    const repetitionLimit = coupon.repition_limit

    let totalBuyItems = 0
    let couponDetail = {}

    //Calculate how many "buy" items are in the cart
    cart.forEach(item => {
        if (buyArray.includes(item.product_id)) {
            totalBuyItems += item.quantity
        }
    })

    const couponUses = Math.min(Math.floor(totalBuyItems / buyThreshold), repetitionLimit)

    //Find free items from the getArray
    if (couponUses > 0) {
        let freeItemsCount = couponUses * getQuantity

        // find eligible get items and apply the free items
        cart.forEach(item => {
            if (getArray.includes(item.product_id)) {
                const freeQty = Math.min(item.quantity, freeItemsCount)
                couponDetail= {"coupon_id": coupon.id, type: COUPON_TYPE['bxgy'], discount: freeQty*item.price}
            }
        })
    }

    return {
        couponDetail,
        isCouponApplicable: couponUses > 0
    }
}

module.exports = {
    create, list, getCoupon, deleteCoupon, applicableCoupon, applyCoupon
}