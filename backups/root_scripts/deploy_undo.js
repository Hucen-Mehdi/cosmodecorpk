const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

        // Get modified files from git
        console.log('🔍 Detecting modified files...');
        const modifiedFiles = execSync('git diff --name-only', { encoding: 'utf8' })
            .split('\n')
            .filter(file => file.trim() !== '' && fs.existsSync(file.trim()));

        // Also get untracked files (optional, but let's include important ones)
        const untrackedFiles = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' })
            .split('\n')
            .filter(file => file.trim() !== '' && fs.existsSync(file.trim()));

        const allFiles = [...new Set([...modifiedFiles, ...untrackedFiles])];

        console.log(`📦 Found ${allFiles.length} files to sync.`);

        for (const file of allFiles) {
            // Skip large or unnecessary directories/files
            if (file.startsWith('.next') || file.startsWith('node_modules') || file.includes('backups')) continue;

            const localPath = path.resolve(file);
            const remotePath = path.join(appDir, file.replace(/\\/g, '/')).replace(/\\/g, '/');

            // Ensure remote directory exists
            const remoteDir = path.dirname(remotePath);
            await ssh.execCommand(`mkdir -p "${remoteDir}"`);

            console.log(`📤 Uploading ${file}...`);
            await ssh.putFile(localPath, remotePath);
        }

        // Run Build
        console.log('🏗️  Building Next.js app on VPS...');
        const buildResult = await ssh.execCommand('npm run build', { cwd: appDir });
        console.log(buildResult.stdout);
        if (buildResult.stderr && !buildResult.stderr.includes('warn') && buildResult.code !== 0) {
            console.error('❌ Build failed:', buildResult.stderr);
        } else {
            console.log('✅ Build complete.');
        }

        // Restart PM2
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
