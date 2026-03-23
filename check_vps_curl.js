const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const ssh = new NodeSSH();
ssh.connect({host: '72.61.214.54', username: 'root', privateKey: fs.readFileSync('C:\\Users\\ARC\\.ssh\\id_ed25519', 'utf8')})
.then(() => ssh.execCommand('curl -I http://localhost:3000/uploads/banners/image-1773497902644-443112546.jpg'))
.then(res => { console.log('3000:', res.stdout); })
.then(() => ssh.execCommand('curl -I http://localhost:5000/uploads/banners/image-1773497902644-443112546.jpg'))
.then(res => { console.log('5000:', res.stdout); process.exit(0); })
.catch(e => { console.error(e); process.exit(1); })
