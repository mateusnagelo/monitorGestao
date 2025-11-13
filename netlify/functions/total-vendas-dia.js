const mysql = require('mysql2/promise');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306,
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const today = new Date().toISOString().slice(0, 10);
    const query = `SELECT SUM(total) as total_vendas FROM venda WHERE DATE(data) = ?`;
    const [results] = await connection.execute(query, [today]);
    return {
      statusCode: 200,
      body: JSON.stringify(results[0] || { total_vendas: 0 }),
    };
  } catch (err) {
    console.error('Error executing query:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error executing query' }),
    };
  } finally {
    if (connection) connection.end();
  }
};