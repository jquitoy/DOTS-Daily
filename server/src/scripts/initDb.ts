import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'dots_daily';

  console.log('Connecting to MySQL to ensure database exists...');
  const conn = await mysql.createConnection({ host, port, user, password, multipleStatements: true });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  console.log(`Database ${dbName} ensured.`);

  const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Applying schema...');
  // run schema in target database
  await conn.query(`USE \`${dbName}\`; ${sql}`);

  console.log('Schema applied.');
  await conn.end();
}

main().catch((err) => {
  console.error('Failed to initialize DB:', err);
  process.exit(1);
});
