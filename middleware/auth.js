/* why do we need a middle ware*/
/* when we delete or like try to edit something we need to check certain things */
/* we need to check who created this post , and is he the same guy who is signed in right now an trying to cause these actions */
/* also while liking we check if this person has already liked a post , cause we allow liking only once */

// All of this is handled by MIDDLEWARE 

// In this middleware we just only check if someone is logged in or not , 
// and if someone is logged in who he is
// we just check that the person is authenticated(registered guy)

/**
 * Editing a post 
 * =-=-=-=-=-=-=-=
 * click on edit => auth middleware( to check someone is logged in and who is he) => editPost controller
 */

import jwt from 'jsonwebtoken'

const auth = async (req ,res , next)  => {
    try {
        // =-=-=-=-=-= Checking if the user is allowed to do the actions(delete , edit) =-=-=-=-=-=-=-=-=
      
        // receive the token from frontend
        const token = req.headers.authorization?.split(" ")[1]; 

        // const isCustomAuth = token.length < 500 ;
        /*
         *Reuired when we have both GAuth and custom auth 
         * GAuth token > 500 so from isCustomAuth we can know if its our auth system of GAuth
         */

         let decodedData ;

        //  if( token && isCustomAuth) ** needed when we also have GAuth

        if(token)
        {
            decodedData = jwt.verify( token , "test_secret_string")

            req.userId = decodedData?.id

            // ?. ; conditional chaining 
            // decodedData? : checks if decodedData exists ( i.e. is !null) 
            // decodedData?.id : if its not null , access its id

        }

        // we populated the request body with the property userId , 
        // now this can be accessed in the upcoming actions(controllers)


        next(); 

    } catch (error) {
        console.log(error);
    }
}

export default auth ;

// where to access it ? in the routes