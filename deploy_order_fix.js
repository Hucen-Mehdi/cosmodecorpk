const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');

async function run() {
    try {
        const privateKeyPath = 'C:\\Users\\ARC\\.ssh\\id_ed25519';
        const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

        console.log('🔌 Connecting to VPS...');
        await ssh.connect({
            host: '72.61.214.54',
            username: 'root',
            privateKey: privateKey,
        });
        console.log('✅ Connected!');

        const appDir = '/var/www/cosmodecorpk.com';

        // 1. Upload the updated files
        console.log('📤 Uploading orderRoutes.ts...');
        await ssh.putFile(
            'd:\\cosmodecor\\server\\src\\routes\\orderRoutes.ts',
            `${appDir}/server/src/routes/orderRoutes.ts`
        );

        // 2. Transpile Backend code using tsc
        console.log('🏗️  Compiling backend... ');
        const serverBuild = await ssh.execCommand('npm run build', { cwd: `${appDir}/server` });
        console.log('Server Build Output:', serverBuild.stdout);
        if (serverBuild.stderr) {
            console.error('Server Build Error:', serverBuild.stderr);
        }

        // 3. Restart PM2
        console.log('🔄 Restarting PM2...');
        await ssh.execCommand('pm2 restart cosmo-decor');
        console.log('✅ PM2 restarted.');

        console.log('\n✨ Deployment Complete! ✨');

        ssh.dispose();
    } catch (err) {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    }
}

run();
