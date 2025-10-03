const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
require('dotenv').config();


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve os arquivos HTML/CSS/JS


// Conexão com o banco de dados usando variáveis de ambiente
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao MySQL!');
});

// Rota de cadastro
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send('Preencha todos os campos');

  try {
    const hash = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro ao cadastrar');
      }
      res.send('Cadastro realizado com sucesso!');
    });
  } catch (error) {
    res.status(500).send('Erro interno');
  }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));

app.use(bodyParser.urlencoded({ extended: true }));