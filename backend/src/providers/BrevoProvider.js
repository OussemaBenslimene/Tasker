const brevo = require('@getbrevo/brevo')
import { env } from '~/config/environment'


let apiInstance = new brevo.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customSubject, customHtmlContent) => {
  // Initialize a sendSmtpEmail object with required email information
  let sendSmtpEmail = new brevo.SendSmtpEmail()

  // Sender's email account
  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }

  // Recipient's email account
  sendSmtpEmail.to = [{ email: recipientEmail }]

  // Email subject
  sendSmtpEmail.subject = customSubject

  // Email content
  sendSmtpEmail.htmlContent = customHtmlContent

  // Call the send email action
  // Return a promise with the API response
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}
