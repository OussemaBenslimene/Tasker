import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }

    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), 
      username: nameFromEmail,
      displayName: nameFromEmail, 
      verifyToken: uuidv4()

    }

    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = '[Verify email] Complete your Tasker account setup'
    const htmlContent = `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
    
    <h3 style="color: #333;">Hi ${getNewUser.username},</h3>
    <p style="font-size: 16px; line-height: 1.5;">
      Thanks for signing up for Taskflow. To complete your account setup, please verify your email address by clicking the link below:
    </p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 12px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px; font-size: 16px;">
        Verify my email address
      </a>
    </div>
    
    
    <p style="font-size: 14px; color: #555;">—The Tasker Team</p>
  </div>
`

    // Call Brevo Provider send mail
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

const verifyAccount = async (reqBody) => {
  try {
    // Query user trong Database
    const existUser = await userModel.findOneByEmail(reqBody.email)

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account is already verified!')

    if (existUser.verifyToken !== reqBody.token) throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid token!')

    const updateData = {
      isActive: true,
      verifyToken: null
    }
    const updatedUser = await userModel.update(existUser._id, updateData)
    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account is not verified!')

    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Your Email or Password is incorrect!')
    }
   
    const userInfo = { _id: existUser._id, email: existUser.email }
   
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    )
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) {
    throw error
  }
}

const refreshToken = async (clienRefreshToken) => {
  try {
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clienRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )
    const userInfo = { _id: refreshTokenDecoded._id, email: refreshTokenDecoded.email }

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )

    return { accessToken }
  } catch (error) { throw error }
}

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    const existUser = await userModel.findOneById(userId)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

    let updatedUser = {}

    if (reqBody.current_password && reqBody.new_password) {
      if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Current Password is incorrect!')
      }
      updatedUser = await userModel.update(existUser._id, {
        password: bcryptjs.hashSync(reqBody.new_password, 8)
      })
    } else if (userAvatarFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')
      updatedUser = await userModel.update(existUser._id, {
        avatar: uploadResult.secure_url
      })
    } else {
      updatedUser = await userModel.update(existUser._id, reqBody)
    }

    return pickUser(updatedUser)
  } catch (error) { throw error }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}
