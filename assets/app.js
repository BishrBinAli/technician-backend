let response;

const db = require("/opt/nodejs/utils/db.js");
const responseHandler = require("/opt/nodejs/utils/responseHandler.js");

exports.lambdaHandler = async (event, context) => {
  let statusCode = 200;
  let data, body;
  let httpMethod = event.httpMethod;

  try {
    switch (httpMethod) {
      case "OPTIONS":
        [data, statusCode] = ["Success", 200];
        break;
      case "GET":
        let params = event.queryStringParameters;
        // console.log(params.type);
        if (params.type === "AssetID") {
          [data, statusCode] = await getLastAssetID();
        } else {
          [data, statusCode] = await getAssets(params.id);
        }
        break;
      case "POST":
        body = JSON.parse(event.body);
        // console.log(body);
        [data, statusCode] = await addAsset(body);
        break;
      case "DELETE":
        body = JSON.parse(event.body);
        [data, statusCode] = await deleteAsset(body.asset_id);
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

async function addAsset(body) {
  // console.log(body.formData);
  // console.log(body.image);
  let statusCode;
  let data;
  try {
    console.log(body);
    let col_names_form = Object.keys(body.formData);
    let col_names_other = Object.keys(body.otherData);
    let col_names = [...col_names_form, ...col_names_other];
    col_names = col_names.join();
    console.log(col_names);
    let col_values_form = Object.values(body.formData);
    let col_values_other = Object.values(body.otherData);
    let col_values = [...col_values_form, ...col_values_other];
    console.log(col_values);
    let values = col_values.map((value, index) => `$${index + 1}`);
    values = values.join();
    sql_stmt = `INSERT INTO assets(${col_names}) values(${values})`;
    console.log("sql_stmt", sql_stmt);
    await db.none(
      `INSERT INTO assets(${col_names}) values(${values})`,
      col_values
    );
    data = "success";
    statusCode = 200;
  } catch (err) {
    data = err.message;
    statusCode = 400;
    console.log(err.message);
  }
  return [data, statusCode];
}

async function getAssets(wo_id) {
  const assets = await db.any(`SELECT * from assets WHERE wo_id = $1`, [wo_id]);
  return [assets, 200];
}

async function getLastAssetID() {
  const lastAssetID = await db.one(`SELECT asset_id FROM assets ORDER BY asset_id DESC LIMIT 1`);

  return [lastAssetID, 200];
}

async function deleteAsset(id) {
  if (!id) throw new Error("ID Missing!");

  await db.none("DELETE FROM assets WHERE asset_id = $1", [id]);

  return ["Client Successfully Removed", 200];
}
