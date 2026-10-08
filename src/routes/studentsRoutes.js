const express = require('express');

const studentController = require('../controllers/studentcontroller');
const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/alunos', autenticar, studentController.List_student);

module.exports = router;