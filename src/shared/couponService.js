
const {COUPON_TYPE } = require('../shared/constants')
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
    applySingleCoupon
}