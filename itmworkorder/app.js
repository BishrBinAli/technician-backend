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
    `SELECT a.*,b.device, b.asset_tag, b.floor_no, b.room_no FROM
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
