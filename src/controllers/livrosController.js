const prisma = require('../config/prisma');

const idInstituicaoDoUsuario = (req) => Number(req.usuario?.instituicao);

const listarLivros = async (req, res) => {
  const idInstituicao = idInstituicaoDoUsuario(req);
  if (!idInstituicao) return res.status(401).json({ erro: 'Instituição não identificada.' });

  try {
    const { busca = '', categoria = '', status = '' } = req.query;
    const livros = await prisma.tbl_livros.findMany({
      where: {
        id_instituicao: idInstituicao,
        ...(busca ? {
          OR: [
            { titulo_livro: { contains: String(busca) } },
            { isbn: { contains: String(busca) } },
            { codigo_livro: { contains: String(busca) } }
          ]
        } : {}),
        ...(categoria ? { id_categoria: Number(categoria) } : {})
      },
      include: { tbl_categorias: { select: { id_categoria: true, nome_categoria: true } } },
      orderBy: { titulo_livro: 'asc' }
    });

    const resultado = livros.map((livro) => {
      const statusCalculado = !livro.status_livro
        ? 'Inativo'
        : livro.quantidade_disponivel > 0
          ? 'Disponível'
          : 'Emprestado';
      return { ...livro, status_exibicao: statusCalculado };
    }).filter((livro) => !status || livro.status_exibicao.toLowerCase() === String(status).toLowerCase());

    return res.status(200).json(resultado);
  } catch (error) {
    console.error('Erro ao listar livros:', error);
    return res.status(500).json({ erro: 'Não foi possível carregar o catálogo.' });
  }
};

const listarCategorias = async (req, res) => {
  const idInstituicao = idInstituicaoDoUsuario(req);
  if (!idInstituicao) return res.status(401).json({ erro: 'Instituição não identificada.' });
  try {
    const categorias = await prisma.tbl_categorias.findMany({
      where: { id_instituicao: idInstituicao, status_categoria: true },
      orderBy: { nome_categoria: 'asc' }
    });
    return res.status(200).json(categorias);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    return res.status(500).json({ erro: 'Não foi possível carregar as categorias.' });
  }
};

const criarLivro = async (req, res) => {
  const idInstituicao = idInstituicaoDoUsuario(req);
  if (!idInstituicao) return res.status(401).json({ erro: 'Instituição não identificada.' });
  const { titulo_livro, codigo_livro, autor_livro, isbn, id_categoria, quantidade_total } = req.body;
  if (!titulo_livro?.trim() || !codigo_livro?.trim()) {
    return res.status(400).json({ erro: 'Título e código do livro são obrigatórios.' });
  }
  const quantidade = Number(quantidade_total ?? 1);
  if (!Number.isInteger(quantidade) || quantidade < 1) {
    return res.status(400).json({ erro: 'A quantidade deve ser um número inteiro maior que zero.' });
  }

  try {
    if (id_categoria) {
      const categoria = await prisma.tbl_categorias.findFirst({
        where: { id_categoria: Number(id_categoria), id_instituicao: idInstituicao, status_categoria: true }
      });
      if (!categoria) return res.status(400).json({ erro: 'Categoria inválida para esta instituição.' });
    }
    const livro = await prisma.tbl_livros.create({
      data: {
        titulo_livro: titulo_livro.trim(),
        codigo_livro: codigo_livro.trim(),
        autor_livro: autor_livro?.trim() || null,
        isbn: isbn?.trim() || null,
        id_categoria: id_categoria ? Number(id_categoria) : null,
        id_instituicao: idInstituicao,
        quantidade_total: quantidade,
        quantidade_disponivel: quantidade,
        status_livro: true
      },
      include: { tbl_categorias: { select: { id_categoria: true, nome_categoria: true } } }
    });
    return res.status(201).json(livro);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ erro: 'Já existe um livro com este código nesta instituição.' });
    console.error('Erro ao cadastrar livro:', error);
    return res.status(500).json({ erro: 'Não foi possível cadastrar o livro.' });
  }
};

const atualizarLivro = async (req, res) => {
  const idInstituicao = idInstituicaoDoUsuario(req);
  const idLivro = Number(req.params.id);
  if (!idInstituicao) return res.status(401).json({ erro: 'Instituição não identificada.' });
  if (!Number.isInteger(idLivro)) return res.status(400).json({ erro: 'Identificador de livro inválido.' });

  try {
    const existente = await prisma.tbl_livros.findFirst({ where: { id_livro: idLivro, id_instituicao: idInstituicao } });
    if (!existente) return res.status(404).json({ erro: 'Livro não encontrado.' });

    const { titulo_livro, codigo_livro, autor_livro, isbn, id_categoria, quantidade_total, status_livro } = req.body;
    const data = {};
    if (titulo_livro !== undefined) data.titulo_livro = String(titulo_livro).trim();
    if (codigo_livro !== undefined) data.codigo_livro = String(codigo_livro).trim();
    if (autor_livro !== undefined) data.autor_livro = String(autor_livro).trim() || null;
    if (isbn !== undefined) data.isbn = String(isbn).trim() || null;
    if (id_categoria !== undefined) data.id_categoria = id_categoria ? Number(id_categoria) : null;
    if (status_livro !== undefined) data.status_livro = Boolean(status_livro);
    if (quantidade_total !== undefined) {
      const total = Number(quantidade_total);
      if (!Number.isInteger(total) || total < 1) return res.status(400).json({ erro: 'A quantidade deve ser maior que zero.' });
      const emprestados = existente.quantidade_total - existente.quantidade_disponivel;
      if (total < emprestados) return res.status(400).json({ erro: 'A quantidade não pode ser menor que os exemplares emprestados.' });
      data.quantidade_total = total;
      data.quantidade_disponivel = total - emprestados;
    }

    const livro = await prisma.tbl_livros.update({
      where: { id_livro: idLivro },
      data,
      include: { tbl_categorias: { select: { id_categoria: true, nome_categoria: true } } }
    });
    return res.status(200).json(livro);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ erro: 'Já existe um livro com este código nesta instituição.' });
    console.error('Erro ao atualizar livro:', error);
    return res.status(500).json({ erro: 'Não foi possível atualizar o livro.' });
  }
};

const excluirLivro = async (req, res) => {
  const idInstituicao = idInstituicaoDoUsuario(req);
  const idLivro = Number(req.params.id);
  if (!idInstituicao) return res.status(401).json({ erro: 'Instituição não identificada.' });
  try {
    const livro = await prisma.tbl_livros.findFirst({ where: { id_livro: idLivro, id_instituicao: idInstituicao } });
    if (!livro) return res.status(404).json({ erro: 'Livro não encontrado.' });
    const emprestimos = await prisma.tbl_emprestimos.count({ where: { id_livro: idLivro } });
    if (emprestimos > 0) return res.status(409).json({ erro: 'Este livro possui histórico de empréstimos. Desative-o em vez de excluir.' });
    await prisma.tbl_livros.delete({ where: { id_livro: idLivro } });
    return res.status(200).json({ mensagem: 'Livro excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir livro:', error);
    return res.status(500).json({ erro: 'Não foi possível excluir o livro.' });
  }
};

module.exports = { listarLivros, listarCategorias, criarLivro, atualizarLivro, excluirLivro };
