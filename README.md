# coupon_project
basic coupon functionality

# Basic installation process
 
 node version =v20.9.0
```
 git clone https://github.com/ajay196/coupon_project.git
```
 set up env file and variable
 update config file with your mysql database credential in (src/db/config/config.json)

install Dependency Using npm cammand

```
 npm install
```

run migration
```
 npx sequelize db:migrate
```

start server using
```
 npm start

```

#for using api in code editor use request.http file (use rest client to run the api in vs code)


# Implemented Cases

 coupon can be added, fetch , delete, list all coupon
 get all the applicable coupon based on the cart product
 apply specific coupon on the given cart products by coupon id
 handle error for basic issue ( coupon expired, not fount, invalid)

# Unimplemented Cases
 added coupon code (unique) for the external uses of the coupon

# Assumptions

 all the inactive coupon (is_active = '0') assume to be deleted
 only coupon whose expiry date is greater the current time assume to be active
 in case of buyxgety coupn threshold quantity will be the sum of all the quantity of the product in the buy array

 COUPON_TYPE : {
        "cart-wise":'1',
        "product-wise":'2',
        "bxgy":'3'
    }

# Limitations
 all the payload need to be as per the given format