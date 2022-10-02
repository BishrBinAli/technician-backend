let response;

const db = require("/opt/nodejs/utils/db.js");
const responseHandler = require("/opt/nodejs/utils/responseHandler.js");

exports.lambdaHandler = async (event, context) => {
  let statusCode = 200;
  let data;
  let httpMethod = event.httpMethod;

  try {
    switch (httpMethod) {
      case "GET":
        let params = event.queryStringParameters;
        [data, statusCode] = await getDevices(params.id);
        break;

      default:
        [data, statusCode] = ["Error: Invalid request", 400];
    }
  } catch (err) {
    statusCode = 400;
    data = err.message;
  }

  response = responseHandler(data, statusCode);
  return response;
};

async function getDevices(system_id) {
  const devices = await db.any(`SELECT * from devices WHERE system_id = $1`, [
    system_id,
  ]);
  return [devices, 200];
}
