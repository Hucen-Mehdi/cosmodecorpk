const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const ssh = new NodeSSH();
ssh.connect({host: '72.61.214.54', username: 'root', privateKey: fs.readFileSync('C:\\Users\\ARC\\.ssh\\id_ed25519', 'utf8')})
.then(() => ssh.execCommand('pm2 restart cosmodecor-web cosmodecor-api', { cwd: '/var/www/cosmodecorpk.com' }))
.then(res => { console.log('pm2:', res.stdout); if (res.stderr) console.error(res.stderr); process.exit(0); })
.catch(e => { console.error(e); process.exit(1); })
