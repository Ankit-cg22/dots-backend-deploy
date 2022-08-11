import  express  from "express";

// for hashing the passwords
import bcrypt from 'bcryptjs'

// for authentication
import jwt from 'jsonwebtoken'
// to keep the user logged in by storing info in the local storage

//user model 
import UserModel from '../models/user.js'

import PostMessage from "../models/postMessage.js";

export  const signIn = async (req, res) => {
    // we need email and password  , that comes from frontend
    const {email , password} = req.body ;

    try {
        // find the user
        const existingUser = await UserModel.findOne({ email });

        // check if the user exists or not
        if( !existingUser) return res.status(404).json({message : "User does not exist !! 😕"})

        //check password 

        const correctPassword = await bcrypt.compare( password , existingUser.password ) ;
                                                    // password: the one we received in the request 
                                                    // existingUse.password :the one already present in the db


        if(!correctPassword) return res.status(400).json({message : "Invalid credentials !!"});
        
        const token = jwt.sign( { email : existingUser.email , id : existingUser._id} , "test_secret_string" , {expiresIn : "1h" });

        // we give 3 things : data we want to store , secret string , validity period of the token

        // return the token
        
        res.status(200).json( { result : existingUser , token })

        
    } catch (error) {
        res.status(500).json("Something went wrong !!")
    }


} 

export  const signUp = async (req, res) => {

    // collect data from front end
    const { firstName , lastName , email , password , confirmPassword} = req.body; 

    try {
        
        // check if user already exists
        const existingUser = await UserModel.findOne({ email }); 
        // instead of writing 'email : email' , it is enough to write 'email'

        if( existingUser ) return res.status(400).json({message : "User already exists !  Sign In !"})

        // check if password and confirmPassword are same
        if( password !== confirmPassword ) res.status(400).json({ message : "Password does not match confirm password !!"})


        // now no problems in creating the user , creat it 

        //-=-=-=-=-=-=-=-=-=-=-=-=-= CREATING A USER -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        // hash the password 
        const hashedPassword = await bcrypt.hash( password , 12) ; // generally salt length is set as 12

        // store the data in the db(or model)
        const newUser = await UserModel.create({   
                email : email , 
                name : ` ${firstName} ${lastName} ` , 
                password : hashedPassword
            })

        // create token 
        const token = jwt.sign( { email : newUser.email , id : newUser._id} , "test_secret_string" , {expiresIn : "1h" });

        // send back the user
        res.status(200).json( { result : newUser , token })

    } catch (error) {
        res.status(500).json("Something went wrong !!")
    }
} 

// test_secret_string is for jwt auth , not for password

export const getUserInfo = async(req,res) => {

    const {id} = req.params

    try {
        const posts = await PostMessage.find({ author : { $in : [ id ] } }).sort({_id : -1})
        const user = await UserModel.findById(id)

        res.status(200).json({ user : user ,posts:posts })
        
    } catch (error) {
        console.log(error.message);
        res.status(404).json({ message : error })
    }
}