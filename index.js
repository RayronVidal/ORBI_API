require('dotenv').config();
console.log('JWT_SECRET carregado:', !!process.env.JWT_SECRET);

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const authController = require('./src/controllers/authcontroller');
const studentsRoutes = require('./src/routes/studentsRoutes');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Servidor Orbi API está online!');
});

app.post('/login', authController.login);

app.use('/api', studentsRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});