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
        
        console.log('🗑️ Deleting Next.js API routes that intercept Express...');
        await ssh.execCommand(`rm -rf ${appDir}/app/api/admin/orders`);
        await ssh.execCommand(`rm -rf ${appDir}/app/api/admin/reports`);

        console.log('📤 Uploading modified Express server files...');
        await ssh.putFile('d:\\cosmodecor\\server\\src\\routes\\adminRoutes.ts', `${appDir}/server/src/routes/adminRoutes.ts`);
        await ssh.putFile('d:\\cosmodecor\\server\\package.json', `${appDir}/server/package.json`);
        await ssh.putFile('d:\\cosmodecor\\app\\admin\\orders\\page.tsx', `${appDir}/app/admin/orders/page.tsx`);
        
        console.log('⚙️ Installing dependencies and building Express server...');
        const installProcess = await ssh.execCommand('npm install', { cwd: `${appDir}/server` });
        console.log('Install output:', installProcess.stdout);
        const buildServer = await ssh.execCommand('npm run build', { cwd: `${appDir}/server` });
        console.log('Build output server:', buildServer.stdout);

        console.log('🏗️ Rebuilding Next.js without conflicting API routes...');
        const buildNext = await ssh.execCommand('npm run build:frontend', { cwd: appDir });
        console.log('Build output Next:', buildNext.stdout);

        console.log('🔄 Restarting PM2 processes...');
        await ssh.execCommand('pm2 restart cosmodecor-api');
        await ssh.execCommand('pm2 restart cosmodecor-web');
        
        console.log('✅ All done!');
        ssh.dispose();
    } catch (err) {
        console.error('❌ Failed:', err);
        process.exit(1);
    }
}
run();
