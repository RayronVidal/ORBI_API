const prisma = require('../config/prisma');

const List_student = async (req, res) => {
    const idInstituicao = Number(req.usuario.instituicao);

    if (!idInstituicao) {
        return res.status(401).json({
            erro: 'Instituição não identificada.'
        });
    }

    try {
        const students = await prisma.tbl_alunos.findMany({
            where: {
                id_instituicao: idInstituicao
            },
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
