const express = require('express');

const app = express();
const PORT = 3000;

const authController = require('./src/controllers/authcontroller');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Servidor Orbi API está online!'); 
});

app.post('/login', authController.login);


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

