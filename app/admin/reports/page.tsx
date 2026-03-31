"use client";

import { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, DollarSign, Package, CreditCard, ShoppingBag, Percent } from 'lucide-react';

interface ReportSummary {
    totalOrders: number;
    totalRevenue: number;
    totalProductCost: number;
    totalCOD: number;
    totalShipping: number;
    totalProfit: number;
    profitMargin: number;
    paymentBreakdown: { method: string; count: number; revenue: number }[];
}

export default function ReportsPage() {
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [summary, setSummary] = useState<ReportSummary | null>(null);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = new URL('/api/admin/reports', window.location.origin);
            if (fromDate) url.searchParams.append('from', fromDate);
            if (toDate) url.searchParams.append('to', toDate);

            const res = await fetch(url.toString(), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch summary');
            const data = await res.json();
            setSummary(data.summary);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, [fromDate, toDate]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const token = localStorage.getItem('token');
            const url = new URL('/api/admin/reports', window.location.origin);
            url.searchParams.append('export', 'true');
            if (fromDate) url.searchParams.append('from', fromDate);
            if (toDate) url.searchParams.append('to', toDate);

            const res = await fetch(url.toString(), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Export failed');
            
            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `financial_report_${fromDate || 'all'}_to_${toDate || 'all'}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            a.remove();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsExporting(false);
        }
    };

    const formatPrice = (price: number) => {
    return 'Rs ' + Math.round(price).toLocaleString('en-US');
  };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-8 h-8 text-primary" />
                        Financial Report
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Analyze revenue, costs, and profit margins.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden mb-12">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center flex-wrap">
                    <div className="flex flex-wrap md:flex-nowrap gap-3 items-center w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-600">From Date:</span>
                            <input 
                                type="date" 
                                value={fromDate} 
                                onChange={(e) => setFromDate(e.target.value)} 
                                className="text-sm bg-transparent outline-none text-gray-900 font-bold"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                            <span className="text-sm font-semibold text-gray-600">To Date:</span>
                            <input 
                                type="date" 
                                value={toDate} 
                                onChange={(e) => setToDate(e.target.value)} 
                                className="text-sm bg-transparent outline-none text-gray-900 font-bold"
                            />
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md shadow-indigo-200 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        <Download className="w-5 h-5" />
                        {isExporting ? 'Generating Excel...' : '📥 Download Financial Report'}
                    </button>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="animate-pulse space-y-6">
                            <div className="h-40 bg-gray-100 rounded-3xl" />
                            <div className="h-40 bg-gray-100 rounded-3xl" />
                        </div>
                    ) : summary ? (
                        <div className="grid lg:grid-cols-3 gap-8">
                            
                            {/* main summary box */}
                            <div className="lg:col-span-2">
                                <h2 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-widest text-[11px] bg-gray-100 inline-block px-3 py-1 rounded-lg">Summary For Selected Period</h2>
                                
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ShoppingBag className="w-4 h-4" /></div>
                                            <p className="text-sm text-gray-500 font-bold">Total Orders</p>
                                        </div>
                                        <p className="text-3xl font-black text-gray-900">{summary.totalOrders}</p>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><DollarSign className="w-4 h-4" /></div>
                                            <p className="text-sm text-gray-500 font-bold">Total Revenue</p>
                                        </div>
                                        <p className="text-3xl font-black text-gray-900">{formatPrice(summary.totalRevenue)}</p>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Package className="w-4 h-4" /></div>
                                            <p className="text-sm text-gray-500 font-bold">Total Product Cost</p>
                                        </div>
                                        <p className="text-3xl font-black text-gray-900">{formatPrice(summary.totalProductCost)}</p>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><CreditCard className="w-4 h-4" /></div>
                                            <p className="text-sm text-gray-500 font-bold">COD Fees Paid (17%)</p>
                                        </div>
                                        <p className="text-3xl font-black text-gray-900">{formatPrice(summary.totalCOD)}</p>
                                    </div>
                                    
                                    <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 sm:col-span-2 flex flex-col sm:flex-row justify-between items-center sm:items-start">
                                        <div>
                                            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
                                                <p className="text-sm text-indigo-900/60 font-bold">Total Profit</p>
                                            </div>
                                            <p className="text-4xl font-black text-indigo-600">{formatPrice(summary.totalProfit)}</p>
                                        </div>
                                        <div className="mt-4 sm:mt-0 text-center sm:text-right">
                                            <div className="flex items-center justify-center sm:justify-end gap-2 mb-1">
                                                <Percent className="w-4 h-4 text-indigo-400" />
                                                <p className="text-sm text-indigo-900/60 font-bold">Profit Margin</p>
                                            </div>
                                            <p className="text-2xl font-black text-indigo-500">{summary.profitMargin.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Breakdown Sidebar */}
                            <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl">
                                <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest border-b border-gray-800 pb-4">Payment Breakdown</h3>
                                
                                <div className="space-y-6">
                                    {summary.paymentBreakdown.length === 0 ? (
                                        <p className="text-gray-500 italic">No payment data</p>
                                    ) : summary.paymentBreakdown.map((pm, i) => (
                                        <div key={i} className="flex justify-between items-end border-b border-gray-800 pb-3">
                                            <div>
                                                <p className="font-bold text-lg mb-1">{pm.method}</p>
                                                <p className="text-xs text-gray-400">{pm.count} orders</p>
                                            </div>
                                            <p className="font-black text-rose-400">{formatPrice(pm.revenue)}</p>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-8 pt-6 border-t border-gray-800">
                                    <div className="flex justify-between items-end">
                                        <p className="text-xs text-gray-400 font-bold uppercase">Shipping Costs</p>
                                        <p className="font-bold text-gray-300">{formatPrice(summary.totalShipping)}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400 font-medium">No data available for the selected period.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
