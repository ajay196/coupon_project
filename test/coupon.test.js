const {applySingleCoupon} = require('../src/shared/couponService')
jest.useFakeTimers()
const data = {
    cart_items : [
        {"product_id": 1, "quantity": 6, "price": 50},
        {"product_id": 2, "quantity": 3, "price": 30},
        {"product_id": 3, "quantity": 2, "price": 25}
    ],
    coupon :{
        id: 5,
        coupon_code: 'AFeTEBBHBGS$%^#',
        type: '3',
        product_id: null,
        discount: '0.00',
        discount_max_amount: '0.00',
        threshold: null,
        expiry_date: "2025-02-11T18:30:00.000Z",
        buy_array: '[1,2]',
        buy_threshold: 6,
        get_array: '[3]',
        get_quantity: 1,
        repition_limit: 2,
        is_active: '1',
        created_at: "2024-10-21T16:44:23.000Z",
        modified_at: "2024-10-21T16:44:23.000Z",
        created_by: null,
        modified_by: null
      }
}
test('check if coupon is applicable', async () => {
    const response = applySingleCoupon(data.cart_items, data.coupon)
        await expect(JSON.stringify(response.couponDetail)).toBe(JSON.stringify({ coupon_id: 5, type: '3', discount: 25 }));
  });