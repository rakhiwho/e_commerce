import express from 'express'
import cors from 'cors'
import mongoose  from 'mongoose'
import  {userRouter}  from './routes/user'
import  {productRouter}  from './routes/product'


const app = express();
const URL ='mongodb+srv://rakhydubey4:proj-777@proj-3.nzqixn3.mongodb.net/proj-3';

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000',  // Your frontend origin
    credentials: true  // Allow credentials (cookies) to be sent
  }));
 
app.use('/user' , userRouter);
app.use('/product' ,productRouter)

mongoose.connect(URL);   

app.listen(3001 , ()=>{
    console.log("server start")
})