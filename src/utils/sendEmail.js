const transporter = require("../config/email");

const sendEmail = async (to, name) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: to,
    subject: "DevTinder Account Created Successfully 🎉",

    text: `Hi ${name},

Your DevTinder account has been created successfully!

Welcome to DevTinder. 🚀

Thanks,
DevTinder Team`,

    html: `
      <h2>Welcome to DevTinder, ${name}! 🎉</h2>

      <p>Your account has been created successfully.</p>

      <p>We're happy to have you on DevTinder. 🚀</p>

      <br>

      <p>Thanks,<br>
      DevTinder Team</p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  console.log("Account creation email sent:", info.messageId);

  return info;
};

module.exports = sendEmail;
