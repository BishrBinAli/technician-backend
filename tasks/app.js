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
        [data, statusCode] = await getTasks(params.wo_id);
        break;
      case "PUT":
        body = JSON.parse(event.body);
        [data, statusCode] = await submitTask(body.task_id);
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

async function getTasks(task_id) {

  let tasks = await db.any(
    `SELECT a.*,b.name AS system_name
    FROM notification AS a
    JOIN systems AS b
    ON a.system = b.id
    WHERE a.assigned_wo = $1 and a.type = 'task'`,[task_id]
  ); 

  let statusCode = 200;
  return [tasks, statusCode];
}

async function submitTask(task_id) {
    let statusCode;
    let data;
    try {
      console.log(task_id);
      sql_stmt = `UPDATE notification SET "status" = 'completed' WHERE id = ${task_id}`;
      console.log("sql_stmt", sql_stmt);
      await db.none(`UPDATE notification SET "status" = 'completed' WHERE id = ${task_id}`);
      data = "success";
      statusCode = 200;
    } catch (err) {
      data = err.message;
      statusCode = 400;
      console.log(err.message);
    }
    return [data, statusCode];
  }

