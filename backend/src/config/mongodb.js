import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment'


let taskflowDatabaseInstance = null

const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DB = async (databaseName = env.DATABASE_NAME) => {
    await mongoClientInstance.connect()

    taskflowDatabaseInstance = mongoClientInstance.db(databaseName)
}


export const GET_DB = () => {
    if (!taskflowDatabaseInstance) {
        throw new Error('You must connect to the database first')
    }
    return taskflowDatabaseInstance
}

export const DELETE_DB = async (databaseName) => {
    
    await mongoClientInstance.db(databaseName).dropDatabase()
}


export const CLOSE_DB = async () => {
    await mongoClientInstance.close()
}
