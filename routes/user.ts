import express, { NextFunction } from 'express'
import { Router , Request,Response } from 'express';
import { UserModel } from '../model/user';
import { UserError } from '../error/error';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { AnyObject } from 'mongoose';
const router = express.Router();


router.post('/register' ,async (req :Request , res :Response)=>{

     const { userName , password}= req.body;
     if (!userName ||  !password) {
        res.status(400);
        console.log("errror")
        return res.status(400).json({type : UserError.WRONG_CREDENIALS})
      }
     try {
        const user=await UserModel.findOne({userName :userName});

        if(user){
           return res.status(400).json({type : UserError.USERNAME_ALREADY_EXISTS})
        }
        const hashedPassword = await bcrypt.hash(password ,10);
   
        const newUser = new UserModel({userName , password:hashedPassword});
        await newUser.save();
        res.json({message: "user resgistered succesfully"})
     } catch (error) {
        res.status(500).json({type :error})

     }
    
    


});


router.post('/login', async ( req :Request , res : Response)=>{
 const {userName , password} = req.body;
 try {
    
    const user = await UserModel.findOne({userName})
    if(!user){
    return  res.status(400).json({type:UserError.NO_USER_FOUND});

    }

    const isPasswordValid = await bcrypt.compare(password , user.password);
    if(!isPasswordValid){
      return res.status(500).json({type:UserError.WRONG_CREDENIALS});
    }
    const token = jwt.sign({id: user._id}, "secret" , { expiresIn: '1h' });
    res.json({token ,userID :user._id})


 } catch (error) {
    res.status(500).json({type:error})
 }

})


export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
   const authHeader = req.headers.authorization;
 

   if (authHeader) {
       // Extract the token from the "Bearer <token>" format
      
     const decodedToken = jwt.decode(authHeader);

     
   
       jwt.verify(authHeader, "secret", (err :AnyObject) => {
         
           if (err) {
           
               return res.sendStatus(403); // Forbidden
           }
         
           next(); // Call the next middleware or route handler
       });
   } else {
       return res.sendStatus(401); // Unauthorized
   }
};


router.get('/availableMoney/:userID' ,  async ( req:Request ,res:Response)=>{
   const {userID} = req.params;
try {
   const user = await UserModel.findById(userID)
   if(!user){
   res.status(400).json({type : UserError.NO_USER_FOUND });
   }
   res.json({availableMoney : user.availableMoney})
} catch (error) {
   res.status(500).json(error);
}
}) 

export {router as userRouter}