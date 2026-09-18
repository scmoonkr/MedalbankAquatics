var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var mongoCFG = require('../Config/mongoCFG');

//Create a SMTP emailer object
/*
var emailer = nodemailer.createTransport(smtpTransport({
		//serviceost: "gmail",
		//host: "smtp.gmail.com",
		//port: 25,
		serviceost: "Naver",
		host: 'smtp.naver.com',
        port: 587,
        //secure: true,
        auth: {
			//user: "alibraryschool@gmail.com",		//'yong',
			user: mongoCFG.MAIL_ID,
            pass: mongoCFG.MAIL_PASSWORD,
		},
		tls: {
			rejectUnauthorize: false,
		  },
		  maxConnections: 5,
		  maxMessages: 10,
        //logger: false,
        //debug: false // include SMTP traffic in the logs
    }
));
*/
var emailer = nodemailer.createTransport(smtpTransport(
    {
        host: 'libraryschool.kr',
        port: 25,
        secure: false,
        auth: {
            user: 'webmaster',
            pass: (process.env.MAIL_PASSWORD || '')
        },
        logger: false,
        debug: false // include SMTP traffic in the logs
    }
));
exports.send = 	function(emailAddr, subject, message) {
	return new Promise(function(resolve, reject) {
		let mailOptions = {
			    from: "library4@naver.com",			// 'yong@libraryschool.kr', 	// sender address
			    to: emailAddr,            		// 'ubifine@gmail.com', scmoonkr@naver.com jini1013@korea.com
			    subject: subject, 	 // Subject line
			    html: message
			};	

		// send mail with defined transport object
		emailer.sendMail(mailOptions, function(error, info){
		    if (error){
		    	console.log(error);
					reject('EMAIL_DISPATCH_ERROR');
		    } else {
	   			resolve('OK'); 
		    }
		});
	});
};
