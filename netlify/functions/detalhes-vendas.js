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
    const query = `
      SELECT 
        v.id AS venda_id,
        v.data,
        c.nome AS cliente_nome,
        v.total
      FROM venda v
      LEFT JOIN cliente c ON v.idcliente = c.id
      WHERE DATE(v.data) = ?
      ORDER BY v.data DESC
    `;
    const [results] = await connection.execute(query, [today]);
    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  } catch (err) {
    console.error('Error fetching sales details:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    if (connection) connection.end();
  }
};