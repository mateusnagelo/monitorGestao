const mysql = require('mysql2/promise');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const dbConfig = JSON.parse(event.body);

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.connect();
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Connection successful' }),
    };
  } catch (err) {
    console.error('Error connecting to database:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: `Error connecting to database: ${err.message}` }),
    };
  } finally {
    if (connection) connection.end();
  }
};