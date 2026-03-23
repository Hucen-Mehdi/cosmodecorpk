/** @type {import('next').NextConfig} */
const nextConfig = {

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:5000/api/:path*', // Proxy to Backend
            },
            {
                source: '/uploads/:path*',
                destination: 'http://localhost:5000/uploads/:path*', // Proxy to Backend Uploads
            },
        ];
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
    async redirects() {
        return [
            {
                source: '/ur',
                destination: '/',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
