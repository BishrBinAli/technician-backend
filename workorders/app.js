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
        [data, statusCode] = await getWorkOrders(params.status, params.user_id);
        break;
      case "PUT":
        body = JSON.parse(event.body);
        [data, statusCode] = await submitWorkOrder(body.wo_id);
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

async function getWorkOrders(status, user_id) {
  let workorders = await db.any(
    `SELECT a.wo_id, a.type,a.building_id,a.status,a.details,a.date,b.building_name,b.building_area,ARRAY[24.9909, 51.5493] as building_loc,
    case when a.type = 'Asset Tagging' then CONCAT('AT',a.wo_id)
    else CONCAT('ITM',a.wo_id) 
    end as full_id
    FROM workorders as a 
    JOIN buildings as b 
    ON a.building_id = b.id
    WHERE a.status = $1 AND a.user_id = $2`,
    [status, user_id]
  );

  let statusCode = 200;
  return [workorders, statusCode];
}

async function submitWorkOrder(wo_id) {
  let statusCode;
  let data;
  try {
    console.log(wo_id);
    sql_stmt = `UPDATE workorders SET "status" = 'Completed' WHERE wo_id = ${wo_id}`;
    console.log("sql_stmt", sql_stmt);
    await db.none(`UPDATE workorders SET "status" = 'Completed' WHERE wo_id = ${wo_id}`);
    data = "success";
    statusCode = 200;
  } catch (err) {
    data = err.message;
    statusCode = 400;
    console.log(err.message);
  }
  return [data, statusCode];
}
