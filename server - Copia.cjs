const express = require('express');
const mysql = require('mysql2/promise'); // Importa a versão com suporte a Promises
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Função auxiliar para criar conexão
const dbConnections = {};

async function createConnection(config) {
    return await mysql.createConnection(config);
}

app.post('/api/query', async (req, res) => {
  const { db, query, dbConfig: dynamicConfig } = req.body;
  let connection;
  try {
    connection = await createConnection(dynamicConfig);
    const [results] = await connection.execute(query);
    res.json(results);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).send(`Error executing query: ${err.message}`);
  } finally {
    if (connection) connection.end();
  }
});

app.post('/api/test-connection', async (req, res) => {
  const { dbConfig: dynamicConfig } = req.body;
  let connection;
  try {
    connection = await createConnection(dynamicConfig);
    await connection.connect();
    res.json({ success: true, message: 'Connection successful' });
  } catch (err) {
    console.error('Error connecting to database:', err);
    res.status(500).json({ success: false, message: `Error connecting to database: ${err.message}` });
  } finally {
    if (connection) connection.end();
  }
});

app.post('/api/total-vendas-dia', async (req, res) => {
  const { dbConfig: dynamicConfig } = req.body;
  let connection;
  try {
    connection = await createConnection(dynamicConfig);
    const today = new Date().toISOString().slice(0, 10);
    const query = `SELECT SUM(total) as total_vendas FROM venda WHERE DATE(data) = ?`;
    const [results] = await connection.execute(query, [today]);
    res.json(results[0] || { total_vendas: 0 });
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).send('Error executing query');
  } finally {
    if (connection) connection.end();
  }
});

app.post('/api/dashboard-metrics', async (req, res) => {
    const dbConfig = req.body;

    if (!dbConfig) {
        return res.status(400).json({ error: 'dbConfig is required' });
    }

    let connection;
    try {
        connection = await createConnection(dbConfig);

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
          r.formapagamento,
          SUM(r.valorreal) as total
        FROM
          recpag r
        JOIN
          venda v ON r.documento = v.numero
        WHERE
          DATE(v.data) = ?
        GROUP BY
          r.formapagamento
      `;
    
    console.log('Executing query for dashboard metrics...');
    const [vendasResult] = await connection.execute(vendasQuery, [today, today, firstDayOfMonth, firstDayOfMonth]);
    const [pagamentosResult] = await connection.execute(pagamentosQuery, [today]);

    console.log('Query result:', vendasResult);

    const vendas = vendasResult[0];

    // Processa os resultados de pagamentos
    const vendasPorPagamento = {};
    pagamentosResult.forEach(p => {
      vendasPorPagamento[p.formapagamento] = p.total;
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

    console.log('Sending metrics to frontend:', metrics);
    res.json(metrics);

  } catch (err) {
    console.error('Error fetching dashboard metrics:', err);
    // Retorna uma estrutura de erro com valores zerados para não quebrar o frontend
    res.status(500).json({
      'Valor Vendas': { Dia: 0, Mês: 0 },
      'Ticket Médio': { Dia: 0, Mês: 0 },
      'Quant. Atendimentos': { Dia: 0, Mês: 0 },
      'Vendas por Pagamento': {},
      error: err.message
    });
  } finally {
    if (connection) {
      connection.end();
      console.log('Database connection closed.');
    }
    console.log('--- Finished request for /api/dashboard-metrics ---');
  }
});

app.post('/api/vendas-por-formapagamento', async (req, res) => {
  const { dbConfig: dynamicConfig } = req.body;
  let connection;
  try {
    connection = await createConnection(dynamicConfig);
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
    res.json(results);
  } catch (err) {
    console.error('Error fetching sales by payment method:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.end();
  }
});

app.post('/api/detalhes-vendas', async (req, res) => {
  const { dbConfig: dynamicConfig } = req.body;
  let connection;
  try {
    connection = await createConnection(dynamicConfig);
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
    res.json(results);
  } catch (err) {
    console.error('Error fetching sales details:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.end();
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});