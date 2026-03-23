const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const ssh = new NodeSSH();
ssh.connect({host: '72.61.214.54', username: 'root', privateKey: fs.readFileSync('C:\\Users\\ARC\\.ssh\\id_ed25519', 'utf8')})
.then(() => ssh.execCommand('pm2 list', { cwd: '/var/www/cosmodecorpk.com' }))
.then(res => { console.log('pm2 list:', res.stdout); process.exit(0); })
.catch(e => { console.error(e); process.exit(1); })
