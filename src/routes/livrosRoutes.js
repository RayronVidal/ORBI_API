const express = require('express');
const livrosController = require('../controllers/livrosController');
const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/categorias', autenticar, livrosController.listarCategorias);
router.get('/livros', autenticar, livrosController.listarLivros);
router.post('/livros', autenticar, livrosController.criarLivro);
router.put('/livros/:id', autenticar, livrosController.atualizarLivro);
router.delete('/livros/:id', autenticar, livrosController.excluirLivro);

module.exports = router;
