const mysql = require('mysql2/promise');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { query, dbConfig } = JSON.parse(event.body);

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [results] = await connection.execute(query);
    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  } catch (err) {
    console.error('Error executing query:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Error executing query: ${err.message}` }),
    };
  } finally {
    if (connection) connection.end();
  }
};