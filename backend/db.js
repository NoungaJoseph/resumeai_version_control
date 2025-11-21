const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database schema
const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        reference VARCHAR(255) UNIQUE NOT NULL,
        external_reference VARCHAR(255),
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        amount VARCHAR(50),
        phone VARCHAR(20),
        operator VARCHAR(50),
        operator_code VARCHAR(50),
        webhook_received BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

const getTransaction = async (reference) => {
  try {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE reference = $1',
      [reference]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
};

const updateTransaction = async (reference, data) => {
  try {
    const existing = await getTransaction(reference);
    
    if (existing) {
      // Update existing
      await pool.query(
        `UPDATE transactions 
         SET status = $1, operator = $2, operator_code = $3, webhook_received = $4, last_updated = NOW()
         WHERE reference = $5`,
        [
          data.status || existing.status,
          data.operator || existing.operator,
          data.operator_code || existing.operator_code,
          data.webhook_received || false,
          reference
        ]
      );
    } else {
      // Insert new
      await pool.query(
        `INSERT INTO transactions (reference, external_reference, status, amount, phone, created_at, last_updated)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [reference, data.external_reference, data.status, data.amount, data.phone]
      );
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
  }
};

module.exports = { pool, initializeDatabase, getTransaction, updateTransaction };
