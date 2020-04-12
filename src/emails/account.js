const sgMail = require('@sendgrid/mail')
const fromEmail = 'brandon_temp24@yahoo.com'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: fromEmail,
        subject: 'Welcome',
        text: `Welcome to the app, ${name}.`
    })
}

const sendOnCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: fromEmail,
        subject: 'Goodbye',
        text: 'You deleted your account'
    })
}

module.exports = {
    sendWelcomeEmail,
    sendOnCancelationEmail
}