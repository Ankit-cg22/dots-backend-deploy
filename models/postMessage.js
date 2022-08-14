
import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
    title: String,
    message: String,
    name: String,
    author: String,
    tags: [String],
    selectedFile: String,
    likes: { type: [String], default: [] },
    comments: { 
        type: [{
            user : {
                type : mongoose.SchemaTypes.ObjectId,
                ref : "UserModel" ,
            },
            comment : String ,
            createdAt: {
                type: Date,
                default: Date.now
            },
        }]
        , default: [] },
    createdAt: {
        type: Date,
        default: Date.now ,
    },
    longitude: String ,
    latitude : String ,
})

var PostMessage = mongoose.model('PostMessage', postSchema);

export default PostMessage;