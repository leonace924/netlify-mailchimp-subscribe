const request = require("request");

const mailChimpAPI = process.env.MAILCHIMP_API_KEY;
const mailChimpListID = process.env.MAILCHIMP_LIST_ID;
const mcRegion = process.env.MAILCHIMP_REGION;

module.exports.handler = (event, context, callback) => {
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

  const data = {
    email_address: email,
    status: "subscribed",
    merge_fields: {},
  };

  const subscriber = JSON.stringify(data);

  request(
    {
      method: "POST",
      url: `https://${mcRegion}.api.mailchimp.com/3.0/lists/${mailChimpListID}/members`,
      body: subscriber,
      headers: {
        Authorization: `apikey ${mailChimpAPI}`,
        "Content-Type": "application/json",
      },
    },
    (error, response, body) => {
      if (error) {
        callback(error, null);
      }
      const bodyObj = JSON.parse(body);

      if (
        response.statusCode < 300 ||
        (bodyObj.status === 400 && bodyObj.title === "Member Exists")
      ) {
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
      } else {
        console.log("Error from mailchimp", bodyObj.detail);
        callback(bodyObj.detail, null);
      }
    }
  );
};
