const express = require('express');

const studentController = require('../controllers/studentcontroller');

const router = express.Router();

router.get('/alunos', studentController.List_student);

module.exports = router;