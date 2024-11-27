import {Schema , model} from 'mongoose'


export interface Iuser{

    _id?:string;
    userName :string;
    password:string;
    availableMoney:number;
     purchasedItem:string[];

}

const userSchema = new Schema<Iuser>({
    userName:{
        type:String ,
        required:true,
        unique:true
    },
    password:{
        type:String,
        rezquired:true
    },
    availableMoney:{
        type:Number,
        required:true,
        default:5000
    },

    purchasedItem :[
        {type :   Schema.Types.ObjectId ,ref:'products' , default:[]}
    ]
});
export const UserModel =model<Iuser>("user",userSchema);