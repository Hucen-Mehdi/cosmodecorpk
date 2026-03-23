const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const ssh = new NodeSSH();
ssh.connect({host: '72.61.214.54', username: 'root', privateKey: fs.readFileSync('C:\\Users\\ARC\\.ssh\\id_ed25519', 'utf8')})
.then(() => ssh.execCommand('cat server/dist/routes/adminRoutes.js | grep "const uploadPath"', { cwd: '/var/www/cosmodecorpk.com' }))
.then(res => { console.log('adminRoutes.js:', res.stdout); process.exit(0); })
.catch(e => { console.error(e); process.exit(1); })
