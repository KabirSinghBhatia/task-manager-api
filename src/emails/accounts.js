const SibApiV3Sdk = require("sib-api-v3-sdk");
let defaultClient = SibApiV3Sdk.ApiClient.instance;

let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

sendSmtpEmail.sender = {
  name: process.env.EMAIL_SENDER_ADDRESS,
  email: process.env.EMAIL_SENDER_NAME,
};

const sendWelcomeEmail = (email, name) => {
  sendSmtpEmail.to = [{ email }];
  sendSmtpEmail.subject = "Thanks for joining in!";
  sendSmtpEmail.textContent = `Welcome to the Task Manager app, ${name}. Let me know about your experience with the app. Hope you have a good one`;
  apiInstance.sendTransacEmail(sendSmtpEmail);
};

const sendCancellationEmail = (email, name) => {
  sendSmtpEmail.to = [{ email }];
  sendSmtpEmail.subject = "Task Manager Cancellation";
  sendSmtpEmail.textContent = `Thanks for using the Task Manager app. Sorry to see you leave. Goodbye, ${name}. Hope to see you again sometime soon. Peace!`;
  apiInstance.sendTransacEmail(sendSmtpEmail);
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
};
