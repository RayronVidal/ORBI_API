const prisma = require('../config/prisma');

const listarEmprestimos = async (req, res) => {
    const idInstituicao = Number(req.usuario.instituicao);

    if (!idInstituicao) {
        return res.status(401).json({
            erro: 'Instituição não identificada.'
        });
    }

    try {
        const emprestimos = await prisma.tbl_emprestimos.findMany({
            where: {
                tbl_alunos: {
                    is: { id_instituicao: idInstituicao }
                }
            },
            orderBy: {
                data_emprestimo: 'desc'
            },
            select: {
                id_emprestimo: true,
                data_emprestimo: true,
                data_devolucao_prevista: true,
                data_devolucao_real: true,
                status_emprestimo: true,
                tbl_alunos: {
                    select: {
                        id_aluno: true,
                        nome_aluno: true,
                        matricula_aluno: true,
                        serie_aluno: true,
                        turma_aluno: true
                    }
                },
                tbl_livros: {
                    select: {
                        id_livro: true,
                        titulo_livro: true,
                        codigo_livro: true
                    }
                },
                tbl_usuarios: {
                    select: {
                        id_usuario: true,
                        nome_usuario: true
                    }
                }
            }
        });

        const hoje = new Date();

        const resultado = emprestimos.map((emprestimo) => {
            const atrasado =
                emprestimo.status_emprestimo === 'ATIVO' &&
                new Date(emprestimo.data_devolucao_prevista) < hoje;

            return {
                id: emprestimo.id_emprestimo,
                aluno: emprestimo.tbl_alunos,
                livro: emprestimo.tbl_livros,
                professorResponsavel: emprestimo.tbl_usuarios,
                dataEmprestimo: emprestimo.data_emprestimo,
                dataDevolucaoPrevista: emprestimo.data_devolucao_prevista,
                dataDevolucaoReal: emprestimo.data_devolucao_real,
                status: atrasado ? 'ATRASADO' : emprestimo.status_emprestimo
            };
        });

        return res.status(200).json({
            total: resultado.length,
            emprestimos: resultado
        });
    } catch (error) {
        console.error('Erro ao listar empréstimos:', error);

        return res.status(500).json({
            erro: 'Erro ao listar empréstimos da instituição.'
        });
    }
};

module.exports = {
    listarEmprestimos
};
