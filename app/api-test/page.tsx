'use client';

export default function ApiTest() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-4">API Configuration Test</h1>
                <div className="space-y-4">
                    <div>
                        <p className="font-semibold">NEXT_PUBLIC_API_URL:</p>
                        <p className="bg-gray-100 p-3 rounded font-mono text-sm break-all">
                            {apiUrl || 'NOT SET'}
                        </p>
                    </div>
                    <div>
                        <p className="font-semibold">Expected Production URL:</p>
                        <p className="bg-green-100 p-3 rounded font-mono text-sm break-all">
                            https://cosmodecorpk-production.up.railway.app/api
                        </p>
                    </div>
                    <div>
                        <p className="font-semibold">Status:</p>
                        <p className={`p-3 rounded font-bold ${apiUrl?.includes('railway') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {apiUrl?.includes('railway') ? '✅ Correctly configured for production' : '❌ Still using localhost or not set'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
