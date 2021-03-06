const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Order = require('../models/order');
const Product = require('../models/product');

router.get('/',(req,res,next)=>{
    Order.find()
    .select('product quantity _id')
    .populate('product')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc => {
                return {
                    _id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' +docs._id
                    }
                }
            }),
            
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.post('/',(req,res,next)=>{
    Product.findById(req.body.productId)
    .then(product => {
        if(!product){
            return res.status(404).json({
                message: 'Product Not Found'
            });
        }
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            product: req.body.productId,
            quantity: req.body.quantity,
        });
        return order.save();
    })
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Order Stored',
            createdOrder: {
                _id: result._id,
                product: result.product,
                quantity: result.quantity
            },
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders/' + result._id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.get('/:orderId',(req,res,next)=>{
    const id = req.params.orderId;
   Order.findById(id)
   .populate('product')
   .exec()
   .then(order => {
       if(order){
        res.status(200).json({
            order: order,
            request: {
                type: 'GET',
                url: "http://localhost:3000/orders"
            }
        });
       }else {
           res.status(404).json({
               message: "No entry found for provided ID"
           });
       }
   })
   .catch(err => {
       console.log(err);
       res.status(500).json({error: err
       });
   });
});

router.delete('/:orderId',(req,res,next)=>{
    const id = req.params.orderId;
    Order.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: "Order Deleted!",
            request: {
                type: "POST",
                url: 'http://localhost:3000/orders/',
                body: { productId: 'ID', quantity: 'Number'}
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;