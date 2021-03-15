
    function mailer(usermail, message, subject) {

        var nodemailer = require('nodemailer');

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'haitamreborn18@gmail.com',
                pass: 'gokudera_-_123'
            }
        });

        var mailOptions = {
            from: 'haitamreborn18@gmail.com',
            to: usermail,
            subject: subject,
            html: message
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return false;
            } else {
                console.log("HERE");
                return true;
            }
        });
}

module.exports = {
    mailer
};