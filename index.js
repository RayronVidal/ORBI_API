require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const authController = require('./src/controllers/authcontroller');
const studentsRoutes = require('./src/routes/studentsRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

app.get('/', (req, res) => {
    res.send('Servidor Orbi API está online!');
});

app.post('/login', authController.login);

app.use('/api', dashboardRoutes);
app.use('/api', studentsRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
