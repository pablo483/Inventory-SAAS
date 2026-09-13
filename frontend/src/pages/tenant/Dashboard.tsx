import { useProducts } from '@/hooks/useProducts';
import { useTransactions } from '@/hooks/useInventory';
import { useLowStockReport } from '@/hooks/useReports';
import { Package, AlertTriangle, TrendingUp, ArrowRight, Terminal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useMyRank } from '@/hooks/useSuperAdmin';
import { Trophy } from 'lucide-react';

export default function Dashboard() {
  const { data: productsData, isLoading: isLoadingProducts } = useProducts(0, 1);
  const { data: lowStockData, isLoading: isLoadingLowStock } = useLowStockReport();
  const { data: historyData, isLoading: isLoadingHistory } = useTransactions(0, 5); // Just 5 recent
  const { user } = useAuth();
  const { data: myRankEntry } = useMyRank(user?.role === 'TENANT_ADMIN');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-mono relative z-10">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-cyan-900/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-widest text-cyan-400">SYS.DASHBOARD</h1>
          <p className="text-cyan-600/70 mt-1 text-sm">OVERVIEW OF INVENTORY OPERATIONS</p>
        </div>

        {myRankEntry && (
          <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md border border-amber-500/30 px-5 py-2.5 rounded-none shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-none">
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest">GLOBAL.RANK</div>
              <div className="font-bold text-amber-400">#{myRankEntry.salesRank} <span className="text-amber-700">IN SALES</span></div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Card 1 */}
        <div className="bg-black/40 p-6 rounded-none border border-cyan-900/50 backdrop-blur-xl shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:border-cyan-500/50 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50 group-hover:bg-cyan-400 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-cyan-600 tracking-widest uppercase">Total.Products</h3>
            <div className="p-2 bg-cyan-950/50 border border-cyan-900/50 rounded-none group-hover:border-cyan-500/30 transition-colors">
              <Package className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div className="text-4xl font-bold text-cyan-100">{isLoadingProducts ? '...' : productsData?.totalElements || 0}</div>
          <p className="text-xs text-cyan-700 mt-2 uppercase tracking-wider">ACTIVE CATALOG ITEMS</p>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-black/40 p-6 rounded-none border border-red-900/30 backdrop-blur-xl shadow-sm hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:border-red-500/50 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50 group-hover:bg-red-400 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-red-600/70 tracking-widest uppercase">Alert.LowStock</h3>
            <div className="p-2 bg-red-950/30 border border-red-900/30 rounded-none group-hover:border-red-500/30 transition-colors">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <div className="text-4xl font-bold text-red-400">{isLoadingLowStock ? '...' : lowStockData?.totalLowStockProducts || 0}</div>
          <p className="text-xs text-red-800 mt-2 uppercase tracking-wider">ITEMS REQUIRING ATTENTION</p>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-black/40 p-6 rounded-none border border-orange-900/30 backdrop-blur-xl shadow-sm hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:border-orange-500/50 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/50 group-hover:bg-orange-400 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-orange-600/70 tracking-widest uppercase">Value.AtRisk</h3>
            <div className="p-2 bg-orange-950/30 border border-orange-900/30 rounded-none group-hover:border-orange-500/30 transition-colors">
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <div className="text-4xl font-bold text-orange-400">${isLoadingLowStock ? '...' : lowStockData?.totalValueAtRisk?.toLocaleString() || '0.00'}</div>
          <p className="text-xs text-orange-800 mt-2 uppercase tracking-wider">CAPITAL LOCKED IN LOW STOCK</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Terminal Feed: Recent Transactions */}
        <div className="rounded-none border border-green-900/50 bg-black/80 shadow-[0_0_30px_rgba(34,197,94,0.05)] overflow-hidden flex flex-col relative group">
          {/* Terminal Header */}
          <div className="p-4 border-b border-green-900/50 bg-green-950/20 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-green-500 animate-pulse" />
              <h3 className="font-bold text-sm text-green-500 tracking-widest uppercase">TERM // RECENT_TX</h3>
            </div>
            <Button variant="outline" size="sm" asChild className="border-green-900/50 text-green-500 hover:bg-green-950 hover:text-green-400 rounded-none h-8 text-xs tracking-widest">
              <Link to="/inventory/transactions">LOGS <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-2">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-green-900/30 hover:bg-transparent">
                  <TableHead className="text-green-600 text-xs tracking-widest">TYPE</TableHead>
                  <TableHead className="text-green-600 text-xs tracking-widest">SKU</TableHead>
                  <TableHead className="text-green-600 text-xs tracking-widest text-right">QTY</TableHead>
                  <TableHead className="text-green-600 text-xs tracking-widest text-right">TIMESTAMP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingHistory ? (
                  <TableRow className="border-0 hover:bg-transparent"><TableCell colSpan={4} className="text-center p-8 text-green-500 animate-pulse">LOADING_DATA...</TableCell></TableRow>
                ) : !historyData?.content || historyData.content.length === 0 ? (
                  <TableRow className="border-0 hover:bg-transparent"><TableCell colSpan={4} className="text-center p-8 text-green-700">NO_RECORDS_FOUND.</TableCell></TableRow>
                ) : (
                  historyData.content.map(tx => (
                    <TableRow key={tx.id} className="border-b border-green-900/10 hover:bg-green-950/30 transition-colors">
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 border text-[10px] font-bold uppercase tracking-widest ${
                          tx.transactionType === 'IN'
                            ? 'border-green-500 text-green-400 bg-green-950/50'
                            : 'border-cyan-500 text-cyan-400 bg-cyan-950/50'
                          }`}>
                          {tx.transactionType}
                        </span>
                      </TableCell>
                      <TableCell className="text-green-300 text-xs">{tx.productSku}</TableCell>
                      <TableCell className="text-right font-bold text-green-400 text-xs">{tx.quantity}</TableCell>
                      <TableCell className="text-right text-green-700 text-xs">
                        {new Date(tx.transactionDate).toISOString().slice(0, 16).replace('T', ' ')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Needs Attention Table */}
        <div className="rounded-none border border-red-900/50 bg-black/60 shadow-[0_0_30px_rgba(239,68,68,0.05)] overflow-hidden flex flex-col relative">
          <div className="p-4 border-b border-red-900/50 bg-red-950/20 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="font-bold text-sm text-red-500 tracking-widest uppercase">SYS.WARN // LOW_STOCK</h3>
            </div>
            <Button variant="outline" size="sm" asChild className="border-red-900/50 text-red-500 hover:bg-red-950 hover:text-red-400 rounded-none h-8 text-xs tracking-widest">
              <Link to="/reports/low-stock">ANALYZE <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-2">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-red-900/30 hover:bg-transparent">
                  <TableHead className="text-red-600 text-xs tracking-widest">PRODUCT.ID</TableHead>
                  <TableHead className="text-red-600 text-xs tracking-widest text-right">CUR.STOCK</TableHead>
                  <TableHead className="text-red-600 text-xs tracking-widest text-right">MIN.REQ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingLowStock ? (
                  <TableRow className="border-0 hover:bg-transparent"><TableCell colSpan={3} className="text-center p-8 text-red-500 animate-pulse">SCANNING...</TableCell></TableRow>
                ) : !lowStockData?.items || lowStockData.items.length === 0 ? (
                  <TableRow className="border-0 hover:bg-transparent"><TableCell colSpan={3} className="text-center p-8 text-red-700">ALL SYSTEMS NOMINAL.</TableCell></TableRow>
                ) : (
                  lowStockData.items.slice(0, 5).map(item => (
                    <TableRow key={item.productId} className="border-b border-red-900/10 hover:bg-red-950/30 transition-colors">
                      <TableCell className="font-medium text-red-300 text-xs truncate max-w-[150px]">{item.name}</TableCell>
                      <TableCell className="text-right font-bold text-red-500 text-xs">{item.currentStock}</TableCell>
                      <TableCell className="text-right text-red-800 text-xs">{item.minStockThreshold}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
