// módulos externos
import inquirer from "inquirer";
import chalk from "chalk";

// módulos internos
import fs from "fs";
import path from "path";

// Diretório base para contas
const DATA_DIR = path.join('data', 'accounts');

// Função principal
async function operation() {
    try {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'O que você deseja fazer?',
                choices: ['Criar Conta', 'Consultar Saldo', 'Depositar', 'Sacar', 'Sair'],
            },
        ]);

        switch (action) {
            case 'Criar Conta':
                await createAccount();
                break;
            case 'Consultar Saldo':
                await getAccountBalance();
                break;
            case 'Depositar':
                await deposit();
                break;
            case 'Sacar':
                await withdraw();
                break;
            case 'Sair':
                console.log(chalk.bgBlue.black("Obrigado por usar o programa!"));
                process.exit();
        }

        operation();
    } catch (err) {
        console.log(chalk.bgRed.black("Ocorreu um erro:"), err);
    }
}

// Criar conta
async function createAccount() {
    console.log(chalk.bgGreen.black("Parabéns por escolher o nosso banco!"));
    console.log(chalk.green("Defina as opções da sua conta a seguir"));

    const { accountName } = await inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para a sua conta:',
        },
    ]);

    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    const accountPath = path.join(DATA_DIR, `${accountName}.json`);

    if (fs.existsSync(accountPath)) {
        console.log(chalk.bgRed.black('Esta conta já existe, escolha outro nome!'));
        return createAccount();
    }

    fs.writeFileSync(accountPath, JSON.stringify({ balance: 0 }));
    console.log(chalk.green('Parabéns, a sua conta foi criada!'));
}

// Depositar valor
async function deposit() {
    const accountName = await promptAccountName();
    const amount = await promptAmount('Quanto você deseja depositar?');

    const account = getAccount(accountName);
    account.balance += amount;

    saveAccount(accountName, account);
    console.log(chalk.green(`Foi depositado R$${amount} na sua conta!`));
}

// Sacar valor
async function withdraw() {
    const accountName = await promptAccountName();
    const amount = await promptAmount('Quanto você deseja sacar?');

    const account = getAccount(accountName);

    if (account.balance < amount) {
        console.log(chalk.bgRed.black('Saldo insuficiente!'));
        return withdraw();
    }

    account.balance -= amount;
    saveAccount(accountName, account);

    console.log(chalk.green(`Saque de R$${amount} realizado com sucesso!`));
}

// Consultar saldo
async function getAccountBalance() {
    const accountName = await promptAccountName();
    const account = getAccount(accountName);

    console.log(chalk.bgBlue.black(`O saldo da sua conta é R$${account.balance}`));
}

// Funções auxiliares
async function promptAccountName() {
    const { accountName } = await inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?',
        },
    ]);

    if (!checkAccount(accountName)) {
        return promptAccountName();
    }

    return accountName;
}

async function promptAmount(message) {
    const { amount } = await inquirer.prompt([
        {
            name: 'amount',
            message,
            validate: input => !isNaN(input) && parseFloat(input) > 0 || 'Digite um valor válido!',
        },
    ]);

    return parseFloat(amount);
}

function checkAccount(accountName) {
    const accountPath = path.join(DATA_DIR, `${accountName}.json`);
    if (!fs.existsSync(accountPath)) {
        console.log(chalk.bgRed.black('Esta conta não existe!'));
        return false;
    }
    return true;
}

function getAccount(accountName) {
    const accountPath = path.join(DATA_DIR, `${accountName}.json`);
    return JSON.parse(fs.readFileSync(accountPath, 'utf8'));
}

function saveAccount(accountName, accountData) {
    const accountPath = path.join(DATA_DIR, `${accountName}.json`);
    fs.writeFileSync(accountPath, JSON.stringify(accountData, null, 2));
}

// Inicializa o programa
operation();
