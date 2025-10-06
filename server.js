const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
require('dotenv').config();


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const path = require('path');
app.use(express.static(path.join(__dirname, 'public'))); // Serve os arquivos HTML/CSS/JS


// Conexão com o banco de dados usando variáveis de ambiente
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

// Rota de cadastro
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send('Preencha todos os campos');

  try {
    const hash = await bcrypt.hash(password, 10);
    pool.query(
      'INSERT INTO usuarios (email, senha) VALUES ($1, $2)',
      [email, hash],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Erro ao cadastrar');
        }
        res.send('Cadastro realizado com sucesso!');
      }
    );
  } catch (error) {
    res.status(500).send('Erro interno');
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  pool.query('SELECT * FROM usuarios WHERE email = $1', [email], async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro interno');
    }

    if (result.rows.length === 0) {
      return res.status(401).send('Usuário não encontrado');
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.senha);

    if (match) {
      res.sendFile(path.join(__dirname, 'public', 'principal.html'));
    } else {
      res.status(401).send('Senha incorreta');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));