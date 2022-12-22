const axios = require("axios");
const MailJet = require("node-mailjet");
const mailChimpAPI = process.env.MAILCHIMP_API_KEY;
const mailChimpListID = process.env.MAILCHIMP_LIST_ID;
const mailJetAPI = process.env.MAILJET_KEY;
const mailJetSecret = process.env.MAILJET_SECRET;

exports.handler = (event, context, callback) => {
  try {
    const {
      payload: { data: { email, message, name } },
    } = JSON.parse(event.body);

    console.log('Input from the form', email, message, name);

    if (!email) {
      console.log("missing email");
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          error: "missing email",
        }),
      });
    }

    if (!mailChimpAPI) {
      console.log("missing mailChimpAPI key");
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          error: "missing mailChimpAPI key",
        }),
      });
    }

    if (!mailChimpListID) {
      console.log("missing mailChimpListID key");
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          error: "missing mailChimpListID key",
        }),
      });
    }

    const data = {
      email_address: email,
      status: "pending",
      merge_fields: {
        MESSAGE: String(message),
        NAME: String(name)
      },
    };

    const subscriber = JSON.stringify(data);

    console.log('MAILJET', mailJetAPI, mailJetSecret);
    console.log('MAILCHIMP', mailChimpAPI, mailChimpListID);

    const mailJet = new MailJet({
      mailJetAPI,
      mailJetSecret,
    });

    Promise.all([
      mailJet
        .post("send", { version: "v3.1" })
        .request({
          Messages: [
            {
              From: {
                Email: 'support@shouldyou.co',
                Name: 'Form submission',
              },
              To: [
                {
                  Email: 'lukaszsielski@gmail.com',
                },
              ],
              Subject: "Form Submission",
              TextPart: `User ${name} ${email} submitted the enquiry: ${message}`
            }
          ]
        })
      , axios({
        method: "post",
        url: `https://us7.api.mailchimp.com/3.0/lists/${mailChimpListID}/members/`, //change region (us19) based on last values of ListId.
        data: subscriber,
        auth: {
          username: "apikey", // any value will work
          password: mailChimpAPI,
        },
      })
    ])
      .then(function (response) {
        console.log(response);
        // Do redirect for non JS enabled browsers
        return callback(null, {
          statusCode: 302,
          headers: {
            Location: "/thanks.html",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({}),
        });
      })
      .catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
        }
        console.log(error.config);
        return callback(null, {
          statusCode: 500,
          body: JSON.stringify(error.message),
        });
      });
  } catch (error) {
    console.log(error);
  }
};
