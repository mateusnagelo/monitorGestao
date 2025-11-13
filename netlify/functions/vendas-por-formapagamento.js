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
        fp.descricao AS forma_pagamento,
        SUM(vp.valor) AS total
      FROM venda_pagamento vp
      JOIN formapagamento fp ON vp.idformapagamento = fp.id
      JOIN venda v ON vp.idvenda = v.id
      WHERE DATE(v.data) = ?
      GROUP BY fp.descricao
      ORDER BY total DESC
    `;
    const [results] = await connection.execute(query, [today]);
    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  } catch (err) {
    console.error('Error fetching sales by payment method:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    if (connection) connection.end();
  }
};