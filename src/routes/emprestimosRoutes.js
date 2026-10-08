const express = require('express');

const emprestimosController = require('../controllers/emprestimoscontroller');
const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

// Todos os professores autenticados consultam os empréstimos da própria instituição.
router.get('/emprestimos', autenticar, emprestimosController.listarEmprestimos);

module.exports = router;
