const fetch = require("node-fetch");

const mailChimpAPI = process.env.MAILCHIMP_API_KEY;
const mailChimpListID = process.env.MAILCHIMP_LIST_ID;
const mcRegion = process.env.MAILCHIMP_REGION;

module.exports.handler = async (event, context, callback) => {
  const formData = JSON.parse(event.body);
  const email = formData.email;
  let errorMessage = null;

  if (!formData) {
    errorMessage = "No form data supplied";
    console.log(errorMessage);
    callback(errorMessage);
  }

  if (!email) {
    errorMessage = "No EMAIL supplied";
    console.log(errorMessage);
    callback(errorMessage);
  }

  if (!mailChimpListID) {
    errorMessage = "No LIST_ID supplied";
    console.log(errorMessage);
    callback(errorMessage);
  }

  try {
    const subscriber = {
      email_address: email,
      status: "subscribed",
      merge_fields: {},
    };

    const response = await fetch(
      `https://${mcRegion}.api.mailchimp.com/3.0/lists/${mailChimpListID}/members`,
      {
        method: "POST",
        body: JSON.stringify(subscriber),
        headers: {
          Authorization: `apikey ${mailChimpAPI}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // NOT res.status >= 200 && res.status < 300
      return { statusCode: data.status, body: data.detail };
    }

    callback(null, {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify({
        status: "saved email",
      }),
    });
  } catch (err) {
    console.log(err); // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }), // Could be a custom message or object i.e. JSON.stringify(err)
    };
  }
};
