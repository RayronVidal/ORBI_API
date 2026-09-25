const authService = require('../services/authService');

const login = async (req, res) => {
    const {email, senha} = req.body;
    
    if (!email || !senha) {
        return res.status(400).json({erro: "Email e senha são Obrigatórios."})
    }

    try {
        const usuario = await authService.varificarLogin(email, senha);

        if (!usuario) {
            return res.status(404).json({erro: "Usuario não encontrado."})
        }

        return res.status(200).json({
            "mensagem" : "Usuario existe.",
            "usuario" : usuario
        })
    }

    catch (error) {
        return res.status(500).json({erro: "Erro no servidor."})
    }
};

module.exports = {
    login
};

// hoje fizemos mais alguns ajustes na parte da logica conseguimos avançar bastante ao mesmo tempo que estamos programando o back end (logica) estamos revisando as relaçoes do banco para tudo ficar correto