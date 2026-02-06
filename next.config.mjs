/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: ['lilith-unsensualistic-amparo.ngrok-free.dev'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
};

export default nextConfig;
