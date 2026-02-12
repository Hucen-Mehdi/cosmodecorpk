module.exports = {
    apps: [
        {
            name: 'cosmodecor-web',
            script: 'npm',
            args: 'run start:frontend',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        },
        {
            name: 'cosmodecor-api',
            script: 'npm',
            args: 'run start:server',
            env: {
                NODE_ENV: 'production',
                PORT: 5000,
                DB_SSL: 'false' // Change to true if using managed database with SSL
            }
        }
    ]
};
