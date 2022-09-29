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
                // let params = event.queryStringParameters;
				[data, statusCode] = await getAssets();
				break;
			case "POST":
				let body = JSON.parse(event.body);
                // console.log(body);
				[data, statusCode] = await addAsset(body);
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
        console.log(col_names)
        let col_values_form = Object.values(body.formData);
        let col_values_other = Object.values(body.otherData);
        let col_values = [...col_values_form, ...col_values_other];
        console.log(col_values);
        let values = col_values.map((value, index) =>`$${index + 1}`);
        values = values.join();
        sql_stmt = `INSERT INTO assets(${col_names}) values(${values})`;
        console.log("sql_stmt",sql_stmt);
        await db.none(`INSERT INTO assets(${col_names}) values(${values})`,col_values); 
        data = 'success';
        statusCode = 200;
    } 
    catch (err) {
        data = err.message;
        statusCode = 400;
        console.log(err.message)
    }
    return [data, statusCode];
};

async function getAssets() {
    const assets = await db.any(`SELECT * from assets`);
    return [assets, 200]
}

async function getSystems() {
    const asset = await db.any(`SELECT * from system`);
    return [systsem, 200]
}