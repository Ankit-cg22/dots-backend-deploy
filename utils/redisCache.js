import dotenv from 'dotenv'
dotenv.config()
import Redis from "redis";


const redisClient = Redis.createClient({
    host: process.env.REDIS_HOSTNAME,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
})

redisClient.on('connect' , () => console.log("connected to redis !"))
redisClient.on('error' , (err) => console.log(err))
const DEFAULT_EXPIRY = 60;

export function getOrSetCache(key  , cb){
            // console.log(1)
    return new Promise((resolve , reject) => {
        redisClient.get(key , async (error,data) => {
            if(error) return reject(error)
            // console.log(2)
            
            if(data != null)
            {
            // console.log(3)
                return resolve(JSON.parse(data));
            }   
            // console.log(4)


            const newData = await cb()
            redisClient.setex(key , DEFAULT_EXPIRY , JSON.stringify(newData))
            resolve(newData)
        })
    })
}
