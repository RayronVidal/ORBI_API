const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const verificarLogin = async (email, senha) => {
    const usuarioEncontrado = await prisma.tbl_usuarios.findFirst({
        where: {
            email_usuario: email
        }
    });

    if (!usuarioEncontrado || !usuarioEncontrado.status_usuario) {
        return null;
    }

    const senhaValida = await bcrypt.compare(
        senha,
        usuarioEncontrado.senha_usuario
    );

    if (!senhaValida) {
        return null;
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT não configurado");
    }

    const token = jwt.sign(
        {
            id: usuarioEncontrado.id_usuario,
            email: usuarioEncontrado.email_usuario,
            tipo: usuarioEncontrado.tipo_usuario,
            instituicao: usuarioEncontrado.id_instituicao
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    return {
        id: usuarioEncontrado.id_usuario,
        nome: usuarioEncontrado.nome_usuario,
        email: usuarioEncontrado.email_usuario,
        tipo: usuarioEncontrado.tipo_usuario,
        id_instituicao: usuarioEncontrado.id_instituicao,
        token
    };
};

module.exports = {
    verificarLogin
};
