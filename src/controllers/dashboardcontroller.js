const prisma = require('../config/prisma');

const dashboard = async (req, res) => {
    const idProfessor = Number(req.usuario.id);
    const idInstituicao = Number(req.usuario.instituicao);

    if (!idProfessor || !idInstituicao) {
        return res.status(401).json({
            erro: 'Dados de autenticação inválidos.'
        });
    }

    try {
        const [usuario, instituicao, livros, alunos, professores, emprestimosAtivos, atrasados, livrosDisponiveis, atividadesRecentes] =
            await Promise.all([
                prisma.tbl_usuarios.findUnique({
                    where: { id_usuario: idProfessor },
                    select: {
                        id_usuario: true,
                        nome_usuario: true,
                        email_usuario: true,
                        tipo_usuario: true,
                        id_instituicao: true,
                        status_usuario: true
                    }
                }),

                prisma.tbl_instituicao.findUnique({
                    where: { id_instituicao: idInstituicao },
                    select: {
                        id_instituicao: true,
                        nome_instituicao: true,
                        status_instituicao: true
                    }
                }),

                prisma.tbl_livros.count({
                    where: {
                        id_instituicao: idInstituicao,
                        status_livro: true
                    }
                }),

                prisma.tbl_alunos.count({
                    where: {
                        id_instituicao: idInstituicao,
                        status_aluno: true
                    }
                }),

                prisma.tbl_usuarios.count({
                    where: {
                        id_instituicao: idInstituicao,
                        tipo_usuario: 'PROFESSOR',
                        status_usuario: true
                    }
                }),

                prisma.tbl_emprestimos.count({
                    where: {
                        status_emprestimo: 'ATIVO',
                        tbl_alunos: {
                            is: { id_instituicao: idInstituicao }
                        }
                    }
                }),

                prisma.tbl_emprestimos.count({
                    where: {
                        status_emprestimo: 'ATIVO',
                        data_devolucao_prevista: {
                            lt: new Date()
                        },
                        tbl_alunos: {
                            is: { id_instituicao: idInstituicao }
                        }
                    }
                }),

                prisma.tbl_livros.count({
                    where: {
                        id_instituicao: idInstituicao,
                        status_livro: true,
                        tbl_emprestimos: {
                            none: { status_emprestimo: 'ATIVO' }
                        }
                    }
                }),

                prisma.tbl_emprestimos.findMany({
                    where: {
                        tbl_alunos: {
                            is: { id_instituicao: idInstituicao }
                        }
                    },
                    orderBy: {
                        data_emprestimo: 'desc'
                    },
                    take: 5,
                    select: {
                        id_emprestimo: true,
                        data_emprestimo: true,
                        data_devolucao_prevista: true,
                        status_emprestimo: true,
                        tbl_alunos: {
                            select: {
                                nome_aluno: true
                            }
                        },
                        tbl_livros: {
                            select: {
                                titulo_livro: true
                            }
                        },
                        tbl_usuarios: {
                            select: {
                                nome_usuario: true
                            }
                        }
                    }
                })
            ]);

        if (!usuario || !usuario.status_usuario) {
            return res.status(401).json({
                erro: 'Usuário não encontrado ou inativo.'
            });
        }

        if (usuario.id_instituicao !== idInstituicao) {
            return res.status(403).json({
                erro: 'Usuário não pertence à instituição autenticada.'
            });
        }

        if (!instituicao || !instituicao.status_instituicao) {
            return res.status(403).json({
                erro: 'Instituição não encontrada ou inativa.'
            });
        }

        const atividades = atividadesRecentes.map((emprestimo) => {
            const atrasado =
                emprestimo.status_emprestimo === 'ATIVO' &&
                new Date(emprestimo.data_devolucao_prevista) < new Date();

            return {
                id: emprestimo.id_emprestimo,
                aluno: emprestimo.tbl_alunos.nome_aluno,
                livro: emprestimo.tbl_livros.titulo_livro,
                professor: emprestimo.tbl_usuarios.nome_usuario,
                dataEmprestimo: emprestimo.data_emprestimo,
                dataDevolucaoPrevista: emprestimo.data_devolucao_prevista,
                status: atrasado ? 'ATRASADO' : emprestimo.status_emprestimo
            };
        });

        return res.status(200).json({
            usuario: {
                id: usuario.id_usuario,
                nome: usuario.nome_usuario,
                email: usuario.email_usuario,
                tipo: usuario.tipo_usuario,
                id_instituicao: usuario.id_instituicao
            },
            instituicao: {
                id: instituicao.id_instituicao,
                nome: instituicao.nome_instituicao
            },
            estatisticas: {
                livros,
                alunos,
                professores,
                emprestimosAtivos,
                atrasados,
                livrosDisponiveis
            },
            atividadesRecentes: atividades
        });
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);

        return res.status(500).json({
            erro: 'Erro ao carregar dados do painel.'
        });
    }
};

module.exports = {
    dashboard
};
