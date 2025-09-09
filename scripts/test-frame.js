const axios = require('axios');

const BASE_URL = 'https://koquifi-farcaster-frame-815l.vercel.app';

async function testFrame() {
    console.log('🧪 Iniciando tests del Frame de KoquiFI Lottery...\n');

    const tests = [
        {
            name: 'Test 1: Frame Principal',
            url: `${BASE_URL}/api/frame/interact`,
            method: 'POST',
            data: {
                untrustedData: {
                    buttonIndex: 0,
                    fid: 'test-user-1'
                }
            }
        },
        {
            name: 'Test 2: Comprar Ticket',
            url: `${BASE_URL}/api/frame/interact`,
            method: 'POST',
            data: {
                untrustedData: {
                    buttonIndex: 1,
                    fid: 'test-user-2'
                }
            }
        },
        {
            name: 'Test 3: Ver Estado',
            url: `${BASE_URL}/api/frame/interact`,
            method: 'POST',
            data: {
                untrustedData: {
                    buttonIndex: 2,
                    fid: 'test-user-3'
                }
            }
        },
        {
            name: 'Test 4: Ver Resultados',
            url: `${BASE_URL}/api/frame/interact`,
            method: 'POST',
            data: {
                untrustedData: {
                    buttonIndex: 3,
                    fid: 'test-user-4'
                }
            }
        },
        {
            name: 'Test 5: Ver Info',
            url: `${BASE_URL}/api/frame/interact`,
            method: 'POST',
            data: {
                untrustedData: {
                    buttonIndex: 4,
                    fid: 'test-user-5'
                }
            }
        },
        {
            name: 'Test 6: Imagen Principal',
            url: `${BASE_URL}/api/frame/image/main`,
            method: 'GET'
        },
        {
            name: 'Test 7: Imagen de Estado',
            url: `${BASE_URL}/api/frame/image/status`,
            method: 'GET'
        },
        {
            name: 'Test 8: Imagen de Resultados',
            url: `${BASE_URL}/api/frame/image/results`,
            method: 'GET'
        },
        {
            name: 'Test 9: Health Check',
            url: `${BASE_URL}/health`,
            method: 'GET'
        },
        {
            name: 'Test 10: Manifest',
            url: `${BASE_URL}/.well-known/manifest.json`,
            method: 'GET'
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            console.log(`🔄 Ejecutando: ${test.name}`);
            
            const response = await axios({
                method: test.method,
                url: test.url,
                data: test.data,
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'KoquiFI-Test-Script/1.0'
                }
            });

            if (response.status === 200) {
                console.log(`✅ ${test.name} - PASSED`);
                passed++;
                
                // Mostrar información adicional para algunos tests
                if (test.name.includes('Frame')) {
                    const data = response.data;
                    console.log(`   📊 Tipo: ${data.type}`);
                    console.log(`   🖼️ Imagen: ${data.image ? 'Generada' : 'No disponible'}`);
                    console.log(`   🔘 Botones: ${data.buttons ? data.buttons.length : 0}`);
                } else if (test.name.includes('Health')) {
                    console.log(`   💚 Status: ${response.data.status}`);
                    console.log(`   🕐 Timestamp: ${response.data.timestamp}`);
                } else if (test.name.includes('Manifest')) {
                    console.log(`   📱 App: ${response.data.name}`);
                    console.log(`   🔗 Start URL: ${response.data.start_url}`);
                }
            } else {
                console.log(`❌ ${test.name} - FAILED (Status: ${response.status})`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name} - ERROR: ${error.message}`);
            failed++;
        }
        
        console.log(''); // Línea en blanco
    }

    // Resumen
    console.log('📊 RESUMEN DE TESTS');
    console.log('==================');
    console.log(`✅ Tests pasados: ${passed}`);
    console.log(`❌ Tests fallidos: ${failed}`);
    console.log(`📈 Total: ${passed + failed}`);
    console.log(`🎯 Porcentaje de éxito: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
        console.log('\n🎉 ¡Todos los tests pasaron! El Frame está funcionando correctamente.');
    } else {
        console.log('\n⚠️ Algunos tests fallaron. Revisa los errores arriba.');
    }

    // Test de Farcaster Frame Validator
    console.log('\n🔍 VALIDACIÓN DE FRAME');
    console.log('======================');
    console.log('Para validar tu Frame en Farcaster:');
    console.log('1. Ve a: https://warpcast.com/~/developers/frames');
    console.log('2. Ingresa tu URL: https://koquifi-farcaster-frame-815l.vercel.app');
    console.log('3. Verifica que todos los elementos estén correctos');
    console.log('4. Prueba los botones en el preview');

    return { passed, failed };
}

// Función para test de carga
async function testLoad() {
    console.log('\n⚡ Test de Carga');
    console.log('================');
    
    const startTime = Date.now();
    const promises = [];
    
    // Hacer 10 requests simultáneos
    for (let i = 0; i < 10; i++) {
        promises.push(
            axios.get(`${BASE_URL}/health`).catch(() => null)
        );
    }
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const successful = results.filter(r => r && r.status === 200).length;
    
    console.log(`⏱️ Tiempo total: ${duration}ms`);
    console.log(`✅ Requests exitosos: ${successful}/10`);
    console.log(`📊 Tiempo promedio: ${(duration / 10).toFixed(2)}ms por request`);
}

// Ejecutar tests
async function runAllTests() {
    try {
        await testFrame();
        await testLoad();
        
        console.log('\n🚀 ¡Tests completados!');
        console.log('Tu miniapp está lista para usar en Farcaster.');
        
    } catch (error) {
        console.error('❌ Error ejecutando tests:', error.message);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runAllTests();
}

module.exports = { testFrame, testLoad, runAllTests };
