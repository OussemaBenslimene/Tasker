
import express from 'express'
import cors from 'cors'

import exitHook from 'async-exit-hook'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { APIs_V1 } from './routes/v1'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { corsOptions } from './config/cors'
import { env } from '~/config/environment'
import cookieParser from 'cookie-parser'




import http from 'http'
import socketIo from 'socket.io'
import { inviteUserToBoardSocket } from '~/sockets/inviteUserToBoardSocket'
const path = require('path')

export const app = express()
let server

const START_SERVER = () => {
 
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  
  app.use(cookieParser())

  
  app.use(express.json())

  app.use(cors(corsOptions))
 
 app.options('*', cors(corsOptions))

 
  app.use('/v1', APIs_V1)

  app.use(express.static(path.join(__dirname, 'public')))

  app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  
  app.use(errorHandlingMiddleware)

 
  const server1 = http.createServer(app)
  
  const io = socketIo(server1, { cors: corsOptions })

  
  io.on('connection', (socket) => {
    

    inviteUserToBoardSocket(socket)

   
  })

  if (env.BUILD_MODE === 'production') {
    
    server1.listen(process.env.PORT, () => {
      console.log(`Prod: Server is running at port: ${process.env.PORT}`)
    })
  } else {
    
    server = server1.listen(env.LOCAL_DEV_APP_PORT, '0.0.0.0', () => {
      console.log(`Local: Server is running at http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}`)
    })
  }

  
  exitHook(() => {
    console.log('Server is shutting down...')
    CLOSE_DB()
  })

}

export const STOP_SERVER = async () => {
  if (server) {
    await server.close()
  }
}

(async () => {
  try {
    await CONNECT_DB()
    console.log('Connected to MongoDB Cloud Atlas!')
    START_SERVER()
  } catch (err) {
    console.error(err)
    process.exit(0)
  }
})()
