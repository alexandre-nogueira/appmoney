export class NotificationService {
  public async sendFakeMail(subject: string, to: string, body: string) {
    const nodemailer = require('nodemailer');

    // async..await is not allowed in global scope, must use a wrapper

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let mailAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: mailAccount.user, // generated ethereal user
        pass: mailAccount.pass, // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"App Money" <appmoney@appmoney.com>', // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      html: body, // html body
    });
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
}
