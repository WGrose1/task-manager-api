const sgMail = require('@sendgrid/mail');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'willrgrose92@gmail.com',
        subject: 'Welcome to the Task Manager App',
        text: `Welcome to the app ${name}`
    });
};

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'willrgrose92@gmail.com',
        subject: 'Goodbye ! :(',
        text: `We're sorry to see you go ${name}!`
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
};
