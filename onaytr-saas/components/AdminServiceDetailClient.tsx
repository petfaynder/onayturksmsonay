"use client";

import { useState } from 'react';
import { DollarSign, Landmark, TrendingUp, Layers, CheckCircle2, Ban, Search, ArrowUpDown, Globe, RefreshCw } from 'lucide-react';

interface PricingItem {
  provider: '5sim' | 'herosms';
  countryCode: string;
  countryName: string;
  operator: string;
  costUsd: number;
  costTry: number;
  sellTry: number;
  profitTry: number;
  count: number;
  marginApplied: number;
}

interface Service {
  id: string;
  providerCode: string;
  name: string;
  logoUrl: string | null;
  isActive: boolean;
  margin5sim: number | null;
  marginHerosms: number | null;
}

export default function AdminServiceDetailClient({
  service,
  pricingList,
  totalStock: _totalStock,
  exchangeRate,
}: {
  service: Service;
  pricingList: PricingItem[];
  totalStock: number;
  exchangeRate: number;
}) {
  // Determine available providers based on list contents
  const availableProviders: ('5sim' | 'herosms')[] = [];
  if (pricingList.some(item => item.provider === '5sim')) availableProviders.push('5sim');
  if (pricingList.some(item => item.provider === 'herosms')) availableProviders.push('herosms');

  // Default to first available, or '5sim' if empty
  const [activeTab, setActiveTab] = useState<'5sim' | 'herosms'>(
    availableProviders.length > 0 ? availableProviders[0] : '5sim'
  );

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof PricingItem>('count');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter list by selected provider tab
  const providerList = pricingList.filter(item => item.provider === activeTab);

  // Search filter
  const filteredList = providerList.filter(item => 
    item.countryName.toLowerCase().includes(search.toLowerCase()) ||
    item.countryCode.toLowerCase().includes(search.toLowerCase()) ||
    item.operator.toLowerCase().includes(search.toLowerCase())
  );

  // Sort items
  const sortedList = [...filteredList].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  const handleSort = (field: keyof PricingItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Compute key metrics dynamically for the active provider tab
  const uniqueCountriesCount = new Set(providerList.map(item => item.countryCode)).size;

  const totalStock = providerList.reduce((acc, item) => acc + item.count, 0);

  const minCostItem = providerList.length > 0 
    ? [...providerList].sort((a, b) => a.costTry - b.costTry)[0] 
    : null;

  const maxCostItem = providerList.length > 0 
    ? [...providerList].sort((a, b) => b.costTry - a.costTry)[0] 
    : null;

  const averageProfit = providerList.length > 0
    ? providerList.reduce((acc, item) => acc + item.profitTry, 0) / providerList.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Provider Selector Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab('5sim');
            setSearch('');
          }}
          className={`py-3 px-6 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === '5sim'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>5Sim Sağlayıcısı</span>
          {!availableProviders.includes('5sim') && (
            <span className="text-[10px] bg-slate-100 text-slate-400 py-0.5 px-2 rounded-full font-bold">Stok Yok</span>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('herosms');
            setSearch('');
          }}
          className={`py-3 px-6 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'herosms'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>HeroSMS Sağlayıcısı</span>
          {!availableProviders.includes('herosms') && (
            <span className="text-[10px] bg-slate-100 text-slate-400 py-0.5 px-2 rounded-full font-bold">Stok Yok</span>
          )}
        </button>
      </div>

      {/* Overview Cards (Calculated dynamically for current tab) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Active Countries */}
        <div className="glass-panel p-6 border border-white/60 relative overflow-hidden shadow-xs">
          <div className="absolute right-4 top-4 bg-indigo-50 text-indigo-600 p-3 rounded-2xl">
            <Globe className="h-6 w-6" />
          </div>
          <div className="text-slate-500 text-sm font-bold">Aktif Ülke Sayısı</div>
          <div className="text-3xl font-black text-slate-800 display-font mt-2">
            {uniqueCountriesCount} <span className="text-xs text-slate-500 font-normal">ülke</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Servisin aktif olduğu toplam ülke.</p>
        </div>

        {/* Total Stock */}
        <div className="glass-panel p-6 border border-white/60 relative overflow-hidden shadow-xs">
          <div className="absolute right-4 top-4 bg-teal-50 text-teal-600 p-3 rounded-2xl">
            <Layers className="h-6 w-6" />
          </div>
          <div className="text-slate-500 text-sm font-bold">Toplam Aktif Stok</div>
          <div className="text-3xl font-black text-slate-800 display-font mt-2">
            {totalStock.toLocaleString('tr-TR')} <span className="text-xs text-slate-500 font-normal">adet</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Aktif ülkelerdeki tüm operatörler.</p>
        </div>

        {/* Min Cost */}
        <div className="glass-panel p-6 border border-white/60 relative overflow-hidden shadow-xs">
          <div className="absolute right-4 top-4 bg-blue-50 text-blue-600 p-3 rounded-2xl">
            <Landmark className="h-6 w-6" />
          </div>
          <div className="text-slate-500 text-sm font-bold">En Ucuz Maliyet (TL)</div>
          <div className="text-3xl font-black text-slate-800 display-font mt-2">
            {minCostItem ? `${(minCostItem.costTry ?? 0).toFixed(2)} TL` : '0.00 TL'}
          </div>
          {minCostItem && (
            <p className="text-xs text-slate-400 mt-2 truncate">
              {minCostItem.countryName} ({minCostItem.operator}) • {(minCostItem.costUsd ?? 0).toFixed(2)} $
            </p>
          )}
        </div>

        {/* Max Cost */}
        <div className="glass-panel p-6 border border-white/60 relative overflow-hidden shadow-xs">
          <div className="absolute right-4 top-4 bg-rose-50 text-rose-600 p-3 rounded-2xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div className="text-slate-500 text-sm font-bold">En Yüksek Maliyet (TL)</div>
          <div className="text-3xl font-black text-slate-800 display-font mt-2">
            {maxCostItem ? `${(maxCostItem.costTry ?? 0).toFixed(2)} TL` : '0.00 TL'}
          </div>
          {maxCostItem && (
            <p className="text-xs text-slate-400 mt-2 truncate">
              {maxCostItem.countryName} ({maxCostItem.operator}) • {(maxCostItem.costUsd ?? 0).toFixed(2)} $
            </p>
          )}
        </div>

        {/* Avg Profit */}
        <div className="glass-panel p-6 border border-white/60 relative overflow-hidden shadow-xs">
          <div className="absolute right-4 top-4 bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="text-slate-500 text-sm font-bold">Ortalama Net Kâr (TL)</div>
          <div className="text-3xl font-black text-slate-800 display-font mt-2">
            {averageProfit ? `${(averageProfit ?? 0).toFixed(2)} TL` : '0.00 TL'}
          </div>
          <p className="text-xs text-slate-400 mt-2">Satış başına beklenen net gelir.</p>
        </div>
      </div>

      {/* Pricing List section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/60 p-4 border border-white rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="h-5 w-5 text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ülke veya operatör ara..."
              className="w-full px-2 py-1 bg-transparent text-slate-800 text-sm outline-none font-medium"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs text-slate-600 font-bold bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-xl">
              Filtrelenen: <span className="text-teal-700">{new Set(sortedList.map(item => item.countryCode)).size} Ülke</span> ({sortedList.length} Kombinasyon)
            </div>
            <div className="text-xs text-slate-500 font-bold bg-white/80 border px-3 py-1.5 rounded-xl shadow-xs">
              Güncel Dolar Kuru: <span className="text-slate-800">{(exchangeRate ?? 0).toFixed(4)} TRY</span>
            </div>
          </div>
        </div>

        <div className="glass-panel overflow-hidden border border-white/60">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/40 border-b border-white/60 text-slate-600 text-sm font-bold select-none">
                  <th onClick={() => handleSort('countryName')} className="p-4 cursor-pointer hover:bg-slate-50/50">
                    <div className="flex items-center gap-1.5">Ülke <ArrowUpDown className="h-3.5 w-3.5" /></div>
                  </th>
                  <th onClick={() => handleSort('operator')} className="p-4 cursor-pointer hover:bg-slate-50/50">
                    <div className="flex items-center gap-1.5">Operatör <ArrowUpDown className="h-3.5 w-3.5" /></div>
                  </th>
                  <th onClick={() => handleSort('costUsd')} className="p-4 cursor-pointer hover:bg-slate-50/50">
                    <div className="flex items-center gap-1.5">Alış (USD) <ArrowUpDown className="h-3.5 w-3.5" /></div>
                  </th>
                  <th onClick={() => handleSort('costTry')} className="p-4 cursor-pointer hover:bg-slate-50/50">
                    <div className="flex items-center gap-1.5">Alış (TRY) <ArrowUpDown className="h-3.5 w-3.5" /></div>
                  </th>
                  <th onClick={() => handleSort('sellTry')} className="p-4 cursor-pointer hover:bg-slate-50/50">
                    <div className="flex items-center gap-1.5">Satış (TRY) <ArrowUpDown className="h-3.5 w-3.5" /></div>
                  </th>
                  <th onClick={() => handleSort('marginApplied')} className="p-4 cursor-pointer hover:bg-slate-50/50">
                    <div className="flex items-center gap-1.5">Kâr Marjı <ArrowUpDown className="h-3.5 w-3.5" /></div>
                  </th>
                  <th onClick={() => handleSort('profitTry')} className="p-4 cursor-pointer hover:bg-slate-50/50">
                    <div className="flex items-center gap-1.5">Net Kâr (TRY) <ArrowUpDown className="h-3.5 w-3.5" /></div>
                  </th>
                  <th onClick={() => handleSort('count')} className="p-4 cursor-pointer hover:bg-slate-50/50">
                    <div className="flex items-center gap-1.5">Stok <ArrowUpDown className="h-3.5 w-3.5" /></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedList.map((item, idx) => (
                  <tr 
                    key={`${item.countryCode}-${item.operator}-${idx}`}
                    className="border-b border-white/20 hover:bg-white/40 transition-colors"
                  >
                    <td className="p-4 font-bold text-slate-800">
                      {item.countryName}
                      <span className="block text-xs font-normal text-slate-500 font-mono">Kod: {item.countryCode}</span>
                    </td>
                    <td className="p-4 font-mono text-xs font-bold text-slate-600">
                      {item.operator}
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-sm">
                      $ {(item.costUsd ?? 0).toFixed(4)}
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-sm">
                      {(item.costTry ?? 0).toFixed(2)} TL
                    </td>
                    <td className="p-4 text-slate-800 font-black text-sm">
                      {(item.sellTry ?? 0).toFixed(2)} TL
                    </td>
                    <td className="p-4 text-teal-600 font-bold text-sm">
                      %{item.marginApplied}
                    </td>
                    <td className="p-4 text-emerald-600 font-black text-sm">
                      + {(item.profitTry ?? 0).toFixed(2)} TL
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      {item.count.toLocaleString('tr-TR')}
                    </td>
                  </tr>
                ))}

                {sortedList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 font-bold">
                      Arama kriterlerine uygun fiyatlandırma verisi bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
