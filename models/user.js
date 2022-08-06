// model for the collection that stores user info

import mongoose from 'mongoose'

// define schema

const userSchema = mongoose.Schema({
    name :{ type : String ,required : true} ,
    email:{ type : String ,required : true} ,
    password:{ type : String ,required : true} ,
    id : {type : String}
})

// define the model using the schema
const UserModel = mongoose.model( "UserModel" , userSchema)

// export the model
export default UserModel