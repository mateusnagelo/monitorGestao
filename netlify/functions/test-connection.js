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
    // A conexão é testada implicitamente pela criação bem-sucedida
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Conexão bem-sucedida!' }),
    };
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: `Falha na conexão: ${err.message}` }),
    };
  } finally {
    if (connection) {
      connection.end();
    }
  }
};