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
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

    const vendasQuery = `
      SELECT 
        (SELECT SUM(total) FROM venda WHERE DATE(data) = ?) as total_dia,
        (SELECT COUNT(*) FROM venda WHERE DATE(data) = ?) as count_dia,
        (SELECT SUM(total) FROM venda WHERE data >= ?) as total_mes,
        (SELECT COUNT(*) FROM venda WHERE data >= ?) as count_mes
    `;

    const pagamentosQuery = `
      SELECT 
        formapagamento AS forma_pagamento,
        SUM(valorreal) AS total
      FROM recpag
      WHERE DATE(datapagamento) = ?
      GROUP BY formapagamento
    `;

    const [vendasResult] = await connection.execute(vendasQuery, [today, today, firstDayOfMonth, firstDayOfMonth]);
    const [pagamentosResult] = await connection.execute(pagamentosQuery, [today]);

    const vendas = vendasResult[0];
    const vendasPorPagamento = {};
    pagamentosResult.forEach(p => {
      vendasPorPagamento[p.forma_pagamento] = p.total;
    });

    const metrics = {
      'Valor Vendas': {
        Dia: vendas.total_dia || 0,
        Mês: vendas.total_mes || 0,
      },
      'Ticket Médio': {
        Dia: vendas.count_dia > 0 ? (vendas.total_dia / vendas.count_dia) : 0,
        Mês: vendas.count_mes > 0 ? (vendas.total_mes / vendas.count_mes) : 0,
      },
      'Quant. Atendimentos': {
        Dia: vendas.count_dia || 0,
        Mês: vendas.count_mes || 0,
      },
      'Vendas por Pagamento': vendasPorPagamento,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(metrics),
    };
  } catch (err) {
    console.error('Error fetching dashboard metrics:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    if (connection) {
      connection.end();
    }
  }
};