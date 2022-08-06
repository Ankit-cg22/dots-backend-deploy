import  express from "express";

import { signUp , signIn } from "../controllers/user.js";

const router = express.Router()

// sending data to bacend -> post request

router.post('/signup' , signUp)

router.post('/signin' , signIn)

export default router;