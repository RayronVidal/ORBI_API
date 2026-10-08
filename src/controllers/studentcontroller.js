const prisma = require('../config/prisma');

const List_student = async (req, res) => {
    try {
        const students = await prisma.tbl_alunos.findMany({
            orderBy: {
                nome_aluno: 'asc'
            }
        });

        return res.status(200).json(students);

    } catch (error) {
        console.error('Erro ao buscar alunos:', error);

        return res.status(500).json({
            erro: 'Erro ao buscar alunos'
        });
    }
};

module.exports = {
    List_student
};