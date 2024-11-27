import express, { NextFunction } from 'express'
import { Router , Request,Response } from 'express';
import {productModel } from '../model/product';
import { ProductError, UserError } from '../error/error';
import { verifyToken } from './user';


import { UserModel } from '../model/user';


const router =Router();

router.get("/", verifyToken,async (req :Request , res : Response)=> {
    try {
        const products = await productModel.find({});
         res.json({products})
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
   
} )

router.post('/checkout', verifyToken , async (req :Request , res :Response)=>{
const {customerID , cartItems } = req.body;
try {
    const user= await UserModel.findById(customerID);

    const productIDs =Object.keys(cartItems);
    const products = await productModel.find({_id :{$in :productIDs}});
     if(!user){
        res.status(400).json({type:UserError.NO_USER_FOUND})
     }
     if(products.length != productIDs.length){
        res.status(400).json({type :ProductError.NO_PRODUCT_FOUND})
     }

     let totalPrice =0;
     for(const items in cartItems){
        const product = products.find(product=>String(product._id) === items);
        if(!product){
        return  res.status(400).json({type: ProductError.NO_PRODUCT_FOUND});

        }

        if(product.stockQuantity < cartItems[items]){
        return  res.status(400).json({type: ProductError.NOT_ENOUGH_STOCK});

        }

        totalPrice += product.price * cartItems[items];
        console.log(cartItems[items]);
    }
        if(user.availableMoney < totalPrice){
        return  res.status(400).json({type: ProductError.NO_AVAILABLE_MONEY});

        }
        user.availableMoney -= totalPrice;
        user.purchasedItem.push(...productIDs)
        await user.save();
        await productModel.updateMany({_id : {$in :productIDs}}
             , {$inc : {stockQuantity :-1}})
        res.json({purchasedItems :user.purchasedItem})
        
    
} catch (error) {
    res.status(500).json(error)
}
})

router.get("/purchased-items/:customerID" , async  (req :Request , res :Response)=>{
    const {customerID} = req.params;
    try {
       const user = await UserModel.findById(customerID)
       if(!user){
       res.status(400).json({type : UserError.NO_USER_FOUND });
       }
       const product =await productModel.find({_id : {$in :user.purchasedItem}})
       res.json({purchasedItem : product})
    } catch (error) {
       res.status(500).json(error);
    }
})
 

export {router  as productRouter}
