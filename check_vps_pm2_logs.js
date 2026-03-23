const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const ssh = new NodeSSH();
ssh.connect({host: '72.61.214.54', username: 'root', privateKey: fs.readFileSync('C:\\Users\\ARC\\.ssh\\id_ed25519', 'utf8')})
.then(() => ssh.execCommand('pm2 logs cosmo-server --lines 20', { cwd: '/var/www/cosmodecorpk.com' }))
.then(res => { console.log('Logs:', res.stdout); Object.keys(res).forEach(k=>console.log(k)); process.exit(0); })
.catch(e => { console.error(e); process.exit(1); })
