const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const ssh = new NodeSSH();
ssh.connect({host: '72.61.214.54', username: 'root', privateKey: fs.readFileSync('C:\\Users\\ARC\\.ssh\\id_ed25519', 'utf8')})
.then(() => ssh.execCommand('echo "test" > /var/www/cosmodecorpk.com/public/uploads/test.txt'))
.then(() => ssh.execCommand('curl -v http://localhost:5000/uploads/test.txt'))
.then(res => { console.log('5000:', res.stdout, res.stderr); })
.then(() => ssh.execCommand('curl -v http://localhost:3000/uploads/test.txt'))
.then(res => { console.log('3000:', res.stdout, res.stderr); process.exit(0); })
.catch(e => { console.error(e); process.exit(1); })
