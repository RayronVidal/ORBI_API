const bcrypt = require('bcryptjs');

const senhas = ['123455'];

senhas.forEach((senha) => {
    const hash = bcrypt.hashSync(senha, 10);

    console.log(`Senha: ${senha}`);
    console.log(`Hash:  ${hash}`);
    console.log('--------------------------------');
});