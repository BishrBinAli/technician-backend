let response;
const db = require("/opt/nodejs/utils/db.js");
const responseHandler = require("/opt/nodejs/utils/responseHandler.js");
exports.lambdaHandler = async (event, context) => {
  let statusCode = 200;
  let data;
  let httpMethod = event.httpMethod;
  try {
    switch (httpMethod) {
      case "OPTIONS":
        [data, statusCode] = ["Success", 200];
        break;
      case "GET":
        let params = event.queryStringParameters;
        [data, statusCode] = await getDashboard(params.id);
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
async function getDashboard(user_id) {
  const pending = await db.one(
    `SELECT COUNT(*) from workorders WHERE status = $1 AND user_id = $2`,
    ["Pending", user_id]
  );
  const completed = await db.one(
    `SELECT COUNT(*) from workorders WHERE status = $1 AND user_id = $2`,
    ["Completed", user_id]
  );
  const inprogress = await db.one(
    `SELECT COUNT(*) from workorders WHERE status = $1 AND user_id = $2`,
    ["Inprogress", user_id]
  );
  const dashdata = {
    pending: pending.count,
    completed: completed.count,
    inprogress: inprogress.count,
  };
  return [dashdata, 200];
}
