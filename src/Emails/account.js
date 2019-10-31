const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'tech@wgrose.co.uk',
        subject: 'Welcome to the Task Manager App',
        text: `Welcome to the app ${name}`
    });
};

const sendCancelEmail = (email, name) => {};

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
};
