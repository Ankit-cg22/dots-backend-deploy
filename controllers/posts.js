// all the handlers for routes
// routes /posts.js -> all the routes are declared
// controllers /posts.js -> all the routes are defined

import express from 'express';
import mongoose from 'mongoose';
import { getOrSetCache } from '../utils/redisCache.js';

import PostMessage from '../models/postMessage.js'

export const getPosts = async(req , res)=> {

    const {page} = req.query; // extracting the page no from the url query

    try {
        
        const LIMIT = 5 ; // 5 posts per page
        const startIndex = (Number(page) - 1) * LIMIT ; // in the query string , page becomes string , to convert it to number we use Number()
        // total number of posts    
        const total = await PostMessage.countDocuments({})
        
        //retrive all the posts ,present in the data base
        // const posts = await PostMessage.find().sort({_id : -1}).limit(LIMIT).skip(startIndex) // sort by id in reverse order : newest first 
                                // model
        const posts = await getOrSetCache(`posts?startIndex=${startIndex}` , async()=>{
            const data =  await PostMessage.find().sort({_id : -1}).limit(LIMIT).skip(startIndex)
            return data
        })

        res.json({data :posts , currentPageNumber : Number(page) , totalNumberOfPages : Math.ceil(total/LIMIT)});        
        // we respond with the array of posts
    
    } catch (error) {
        // if error occurs
    
        res.status(404).json( { message : error.message});

    }
}

// query : /posts?page=2 ::-> page = 2
// params : /posts/:id
        //  /posts/123  ::-> id = 123

export const getPostsBySearch = async(req,res) => {

    const {search , tag} = req.query
    try {
        // const title = new RegExp(search, "i");

        // const posts = await PostMessage.find({ $or: [ { title : search }, { tags: { $in: tag.split(',') } } ]});

        const posts = await getOrSetCache(`posts?title=${search}?tag=${tag}`  , async()=>{
            const data =  await PostMessage.find({ $or: [ { title : search }, { tags: { $in: tag.split(',') } } ]});
            return data
        })
        
        res.json({ data : posts })
    } catch (error) {
        // console.log(error)
        res.status(404).json({ message : error })
    }
}

export const fetchPostById = async(req,res) => {

    const {id} = req.params

    try {
        // const post = await PostMessage.findById(id).populate({
        //     path:"comments",
        //     populate:{
        //         path:"user",
        //     }
        // })
        const post = await getOrSetCache(`post?id=${id}` , async()=>{
            const data =  await PostMessage.findById(id).populate({
                path:"comments",
                populate:{
                    path:"user",
                }     
            })       
            return data
        })
        res.status(200).json(post)
        
    } catch (error) {
        console.log(error.message)
        res.status(404).json({ message : error })
    }
}

export const createPost = async(req , res)=> {

    const post = req.body;
    // we will get a req json(containing data filled by author)

    // create new post in the db using this postBody

    const newPost = new PostMessage({ ...post , author : req.userId , createdAt: new Date().toISOString() }); // we save it to the db using the model
    
    try {
        await newPost.save();
        // try saving it to the db

        res.status(201).json(newPost);

    } catch (error) {
        console.log(error)
        
        res.status(409).json({message : error.message});
    }

}


export const updatePost = async( req ,res) => {
    const { id  } = req.params;
    // the parameter in the url is named id
    // we renamed it to _id

    const post = req.body;
    // the updated post that we receive from front end

    // check with mongoose if any post with that id exists or not
    if( !(mongoose.Types.ObjectId.isValid(id)) ) return res.status(404).send(`No post with id : ${id}`);

    const updatedPost = await PostMessage.findByIdAndUpdate( id , {...post , id}, {new : true});

    // the post object does not have the id , so we spread it and also send the id with it , it wil be used by the db
    res.json(updatedPost);
}

export const updateLikes = async(req  , res) => {
    const { id } = req.params;

    // check if user is authenticated
    if( !req.userId)return res.json({message : "User is not authenticated!!"});

    // check with mongoose if any post with that id exists or not
    if( !(mongoose.Types.ObjectId.isValid(id)) ) return res.status(404).send(`No post with id : ${id}`);

    const post = await PostMessage.findById(id);


    // TO CHECK IF HE HAS ALREADY LIKED 

    // we maintain a list of all ids that have liked a post

    // check for the id in the 'haveLiked' list
    const index = post.likes.findIndex((id) => id === String(req.userId)); 

    if( index === -1 )
    {
        // not found in the list , not liked before , like it , push into list
        post.likes.push(req.userId)

    }else{
        //id found , have liked before , now unlike , delete from list
        post.likes = post.likes.filter( (id) => id !== String(req.userId))
    }


    const updatedPost = await PostMessage.findByIdAndUpdate( id , post , {new : true})
    // simply pass the updated post in update request to the db

    res.json(updatedPost);
}

export const deletePost = async(req, res) => {

    const {id} = req.params;

    // check with mongoose if any post with that id exists or not
    if( !(mongoose.Types.ObjectId.isValid(id)) ) return res.status(404).send(`No post with id : ${id}`);
    
    await PostMessage.findByIdAndRemove( id );

    res.json( {message : "Post deleted successfully"})

}

export const postComment=  async(req, res) => {
    const { id } = req.params;
    const { commentObject } = req.body;

    // fetch the post
    const post = await PostMessage.findById(id)
    // add new data
    post.comments.push({user:commentObject.user_id , comment : commentObject.comment})

    // update the data base with the new data
    const updatedPost = await PostMessage.findByIdAndUpdate(id , post , { new : true}).populate({
        path:"comments",
        populate:{
            path:"user",
        }
    })

    res.json(updatedPost)


}
