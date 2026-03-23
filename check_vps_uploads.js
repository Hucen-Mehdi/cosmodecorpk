const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const ssh = new NodeSSH();
ssh.connect({host: '72.61.214.54', username: 'root', privateKey: fs.readFileSync('C:\\Users\\ARC\\.ssh\\id_ed25519', 'utf8')})
.then(() => ssh.execCommand('find /var/www/cosmodecorpk.com -type d -name "uploads"'))
.then(res => { console.log('Upload directories:', res.stdout); })
.then(() => ssh.execCommand('find /var/www/cosmodecorpk.com -name "image-*.jpg" | sort | tail -n 10'))
.then(res => {
   console.log('Recent images:', res.stdout);
   process.exit(0);
})
.catch(e => { console.error(e); process.exit(1); })
