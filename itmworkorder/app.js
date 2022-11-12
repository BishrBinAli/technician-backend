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
        [data, statusCode] = await getAssets(params.status, params.wo_id);
        break;
      case "PUT":
        body = JSON.parse(event.body);
        [data, statusCode] = await submitITM(body);
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

async function getAssets(status, wo_id) {
//   let assets = await db.any(
//     `SELECT a.*, b.device, b.asset_tag, b.floor_no, b.room_no
//     FROM itm_workorders AS a
//     JOIN assets AS b
//     ON a.asset_id = b.asset_id
//     WHERE a.wo_id = $2`,
//     [status, wo_id]
//   );
  let assets = await db.any(
    `SELECT a.*, b.device, b.system, b.asset_tag, b.floor_no, b.room_no FROM
    (
    SELECT asset_id, array_agg("type") AS "types" 
    FROM itm_workorders 
    WHERE wo_id = $1 and status = $2
    GROUP BY asset_id
    ) AS a
    JOIN assets AS b
    ON a.asset_id  = b.asset_id`,[wo_id, status]
  ); 

  let statusCode = 200;
  return [assets, statusCode];
}

async function submitITM(body) {
  let statusCode;
  let data;
  try {
    console.log(body);
    console.log("testtinf");
    console.log(body.asset_id, body.wo_id, body.type);
    console.log(body.data);
    let col_names = Object.keys(body.data);
    let asset_id = body.asset_id;
    let wo_id = body.wo_id;
    let type = body.type;
    col_names = col_names.join();
    console.log(col_names);
    let col_values = Object.values(body.data);
    // col_values = col_values.join();
    console.log(col_values);
    let values = col_values.map((value, index) => `$${index + 1}`);
    values = values.join();
    sql_stmt = `UPDATE itm_workorders SET (${col_names}) = (${values}) WHERE wo_id = ${wo_id} AND asset_id = ${asset_id} AND type = '${type}'`;
    console.log("sql_stmt", sql_stmt);
    // await db.none(
    //   `INSERT INTO assets(${col_names}) values(${values})`,
    //   col_values
    // );
    await db.none(`UPDATE itm_workorders SET (${col_names}) = (${values}) WHERE wo_id = ${wo_id} AND asset_id = ${asset_id} AND "type" = '${type}'`,col_values);
    data = "success";
    statusCode = 200;
  } catch (err) {
    data = err.message;
    statusCode = 400;
    console.log(err.message);
  }
  return [data, statusCode];
}
