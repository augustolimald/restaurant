require('dotenv/config')
var pg = require('pg');
var fs = require('fs');

var dbUrl = process.env.POSTGRES_URL

var sql = fs.readFileSync(__dirname + '/structure.sql').toString();

const client = new pg.Client({ connectionString: dbUrl});

client.connect()
	.then(
		client
			.query(sql)
			.then(() => process.exit(0))
			.catch((error) => {
				console.error(error);
				process.exit(1);
			})
	)