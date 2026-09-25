const { login } = require("../controllers/authcontroller");

const jwt = require('jsonwebtoken');

const usuariosNoBanco = [
    { id: 1, nome: "Rayron", email: "rayron@orbi.com", senha: "123" },
    { id: 2, nome: "Ana", email: "ana@orbi.com", senha: "456" }
];

const varificarLogin = async (email, senha) => {
    const usuarioEncontrado = usuariosNoBanco.find(u => u.email === email);

    if (!usuarioEncontrado) {
        return null; 
    }

    if (usuarioEncontrado.senha !== senha) {
        return null; 
    }

    const token = jwt.sign(
        {id: usuarioEncontrado.id, email: usuarioEncontrado.email },
        'minha_palavra_secreta',
        {expiresIn: '1d'}
    );

    return {
        id: usuarioEncontrado.id,
        nome: usuarioEncontrado.nome,
        email: usuarioEncontrado.email,
        token: token
    };
};

module.exports = {
    varificarLogin
};
