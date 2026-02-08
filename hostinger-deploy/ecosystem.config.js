module.exports = {
    apps: [
        {
            name: 'cosmo-frontend',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            instances: 'max',
            exec_mode: 'cluster',
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            error_file: './logs/frontend-err.log',
            out_file: './logs/frontend-out.log',
            merge_logs: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss'
        },
        {
            name: 'cosmo-server',
            script: './server/dist/index.js',
            instances: 'max',
            exec_mode: 'cluster',
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 5000
            },
            error_file: './logs/server-err.log',
            out_file: './logs/server-out.log',
            merge_logs: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss'
        }
    ]
};
