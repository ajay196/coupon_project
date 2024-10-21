const express = require('express');
const router = express.Router();
const couponController = require('../src/controllers/couponController')

/* GET coupon listing. */
router.post('/coupon', couponController.create);
router.get('/coupon', couponController.list)
router.get('/coupon/:couponId', couponController.getCoupon)
router.delete('/coupon/:couponId', couponController.deleteCoupon)
router.post('/applicable-coupons', couponController.applicableCoupon)
router.post('/apply-coupon/:couponId', couponController.applyCoupon)
module.exports = router;
