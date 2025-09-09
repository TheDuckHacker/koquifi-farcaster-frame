const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
    console.log('🚀 Desplegando contratos en Base Sepolia...');
    
    // Obtener el deployer
    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account:', deployer.address);
    console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString());

    // Desplegar KoquiFI Token
    console.log('📝 Desplegando KoquiFI Token...');
    const KoquiFIToken = await ethers.getContractFactory('KoquiFIToken');
    const kokiToken = await KoquiFIToken.deploy();
    await kokiToken.waitForDeployment();
    const kokiTokenAddress = await kokiToken.getAddress();
    console.log('✅ KoquiFI Token desplegado en:', kokiTokenAddress);

    // Desplegar KoquiFI Lottery
    console.log('🎰 Desplegando KoquiFI Lottery...');
    const KoquiFILottery = await ethers.getContractFactory('KoquiFILottery');
    const lottery = await KoquiFILottery.deploy(
        kokiTokenAddress, // Token address
        ethers.parseEther('0.001'), // Ticket price
        1, // Draw day (Monday)
        20 // Draw hour (8 PM)
    );
    await lottery.waitForDeployment();
    const lotteryAddress = await lottery.getAddress();
    console.log('✅ KoquiFI Lottery desplegado en:', lotteryAddress);

    // Configurar permisos
    console.log('🔐 Configurando permisos...');
    await kokiToken.grantRole(await kokiToken.MINTER_ROLE(), lotteryAddress);
    console.log('✅ Permisos configurados');

    // Verificar contratos
    console.log('🔍 Verificando contratos...');
    try {
        await hre.run('verify:verify', {
            address: kokiTokenAddress,
            constructorArguments: []
        });
        console.log('✅ KoquiFI Token verificado');
    } catch (error) {
        console.log('⚠️ Error verificando KoquiFI Token:', error.message);
    }

    try {
        await hre.run('verify:verify', {
            address: lotteryAddress,
            constructorArguments: [
                kokiTokenAddress,
                ethers.parseEther('0.001'),
                1,
                20
            ]
        });
        console.log('✅ KoquiFI Lottery verificado');
    } catch (error) {
        console.log('⚠️ Error verificando KoquiFI Lottery:', error.message);
    }

    // Generar archivo de configuración
    const config = {
        network: 'baseSepolia',
        chainId: 84532,
        rpcUrl: 'https://sepolia.base.org',
        explorerUrl: 'https://sepolia.basescan.org',
        contracts: {
            kokiToken: {
                address: kokiTokenAddress,
                name: 'KoquiFI Token',
                symbol: 'KOKI',
                decimals: 18
            },
            lottery: {
                address: lotteryAddress,
                name: 'KoquiFI Lottery',
                ticketPrice: '0.001',
                drawDay: 1,
                drawHour: 20
            }
        },
        deployment: {
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            blockNumber: await ethers.provider.getBlockNumber()
        }
    };

    // Guardar configuración
    const fs = require('fs');
    fs.writeFileSync('deployment-config.json', JSON.stringify(config, null, 2));
    console.log('📄 Configuración guardada en deployment-config.json');

    // Mostrar resumen
    console.log('\n🎉 ¡Despliegue completado!');
    console.log('=====================================');
    console.log('🔗 KoquiFI Token:', kokiTokenAddress);
    console.log('🎰 KoquiFI Lottery:', lotteryAddress);
    console.log('🌐 Explorer:', `https://sepolia.basescan.org/address/${lotteryAddress}`);
    console.log('=====================================');
    
    console.log('\n📋 Variables de entorno para .env:');
    console.log(`KOKI_TOKEN_ADDRESS=${kokiTokenAddress}`);
    console.log(`LOTTERY_CONTRACT_ADDRESS=${lotteryAddress}`);
    console.log(`BASE_RPC_URL=https://sepolia.base.org`);
    console.log(`BASE_CHAIN_ID=84532`);
    console.log(`BASE_EXPLORER_URL=https://sepolia.basescan.org`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Error en el despliegue:', error);
        process.exit(1);
    });
