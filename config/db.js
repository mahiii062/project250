// config/db.js
import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',      // or your WSL IP if localhost fails
  user: 'root',
  password: '',
  database: 'nibashDB'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL database nibashDB');
  }
});

// ES module export
export default db.promise();  
