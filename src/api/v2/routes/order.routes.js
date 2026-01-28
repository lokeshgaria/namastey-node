const express = require("express");

 
const router = express.Router();

/**
 * Setup order routes
 * @param {Object} orderController - Injected controller
 * @param {Function} userAuth - Auth middleware
 */

const setupOrderRoutes = (orderController,userAuth) => {
    router.post("/create-order", userAuth, orderController.createOrder);

    router.post("/verify-payment", userAuth, orderController.verifyPayment);
    return router;
}   


module.exports = setupOrderRoutes;