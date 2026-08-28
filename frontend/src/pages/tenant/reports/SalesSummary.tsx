import { useState } from 'react';
import { useSalesSummaryReport, exportSalesSummaryReport } from '@/hooks/useReports';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Download, Calendar, DollarSign, ShoppingCart, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function SalesSummary() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: report, isLoading } = useSalesSummaryReport(startDate, endDate);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportSalesSummaryReport(startDate, endDate);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 relative z-10 font-mono">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyan-900/50 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 border border-cyan-500/50 bg-cyan-950/20 text-cyan-400 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-widest text-cyan-400 uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              SYS.SALES_SUMMARY
            </h1>
            <p className="text-cyan-600/70 mt-1 text-sm uppercase tracking-widest">
              REVENUE ANALYTICS & PERFORMANCE
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 border border-cyan-900/50 px-2 bg-black/60 h-9 rounded-none">
            <Calendar className="h-3 w-3 text-cyan-600/70" />
            <Input 
              type="date" 
              className="w-[120px] h-8 border-0 focus-visible:ring-0 shadow-none px-1 p-0 text-xs bg-transparent text-cyan-400 [color-scheme:dark]" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-cyan-600/70 text-[10px] uppercase tracking-widest">TO</span>
            <Input 
              type="date" 
              className="w-[120px] h-8 border-0 focus-visible:ring-0 shadow-none px-1 p-0 text-xs bg-transparent text-cyan-400 [color-scheme:dark]" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || !report} 
            className="rounded-none bg-cyan-950/30 text-cyan-400 border border-cyan-900/50 hover:bg-cyan-900/40 hover:text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)] transition-all whitespace-nowrap text-xs tracking-widest uppercase"
          >
            <Download className="mr-2 h-4 w-4" /> {isExporting ? 'EXPORTING...' : 'EXPORT_CSV'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-black/80 border border-cyan-900/50 p-6 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.05)] relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-16 h-16 text-cyan-400" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] tracking-widest uppercase text-cyan-600/70">TOTAL_REVENUE</p>
          </div>
          <h2 className="text-3xl font-bold text-cyan-300 font-mono drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
            ${report?.totalSalesValue?.toLocaleString() || '0.00'}
          </h2>
          <div className="mt-4 h-1 w-full bg-cyan-950/30 relative">
            <div className="absolute top-0 left-0 h-full bg-cyan-500/50 w-full animate-pulse"></div>
          </div>
        </div>
        
        <div className="bg-black/80 border border-cyan-900/50 p-6 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.05)] relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShoppingCart className="w-16 h-16 text-cyan-400" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] tracking-widest uppercase text-cyan-600/70">ITEMS_SOLD</p>
          </div>
          <h2 className="text-3xl font-bold text-cyan-300 font-mono drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
            {report?.totalQuantitySold || 0}
          </h2>
          <div className="mt-4 h-1 w-full bg-cyan-950/30 relative">
            <div className="absolute top-0 left-0 h-full bg-cyan-500/50 w-3/4"></div>
          </div>
        </div>

        <div className="bg-black/80 border border-cyan-900/50 p-6 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.05)] relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 className="w-16 h-16 text-cyan-400" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] tracking-widest uppercase text-cyan-600/70">TRANSACTIONS</p>
          </div>
          <h2 className="text-3xl font-bold text-cyan-300 font-mono drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
            {report?.totalTransactions || 0}
          </h2>
          <div className="mt-4 h-1 w-full bg-cyan-950/30 relative">
            <div className="absolute top-0 left-0 h-full bg-cyan-500/50 w-1/2"></div>
          </div>
        </div>

        <div className="bg-black/80 border border-cyan-900/50 p-6 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.05)] relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Tag className="w-16 h-16 text-cyan-400" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] tracking-widest uppercase text-cyan-600/70">AVG_ORDER_VALUE</p>
          </div>
          <h2 className="text-3xl font-bold text-cyan-300 font-mono drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
            ${report?.averageTransactionValue?.toLocaleString() || '0.00'}
          </h2>
          <div className="mt-4 h-1 w-full bg-cyan-950/30 relative">
            <div className="absolute top-0 left-0 h-full bg-cyan-500/50 w-2/3"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-none border border-cyan-900/50 bg-black/80 shadow-[0_0_15px_rgba(6,182,212,0.05)] overflow-hidden relative group">
          <div className="p-4 border-b border-cyan-900/50 bg-cyan-950/20">
            <h3 className="font-bold tracking-widest text-cyan-400 uppercase text-sm">TOP_SELLING_ASSETS</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-cyan-950/10">
                <TableRow className="border-b border-cyan-900/50 hover:bg-transparent">
                  <TableHead className="text-cyan-500 text-[10px] tracking-widest uppercase">PRODUCT_ID</TableHead>
                  <TableHead className="text-right text-cyan-500 text-[10px] tracking-widest uppercase">QTY_SOLD</TableHead>
                  <TableHead className="text-right text-cyan-500 text-[10px] tracking-widest uppercase">REVENUE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                    <TableCell colSpan={3} className="text-center p-8">
                      <div className="inline-block text-cyan-500 animate-pulse tracking-widest text-xs">ANALYZING_DATA...</div>
                    </TableCell>
                  </TableRow>
                ) : !report?.topSellingProducts || report.topSellingProducts.length === 0 ? (
                  <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                    <TableCell colSpan={3} className="text-center p-8 text-cyan-700 text-xs tracking-widest uppercase">NO_SALES_DATA_FOUND.</TableCell>
                  </TableRow>
                ) : (
                  report.topSellingProducts.map((item) => (
                    <TableRow key={item.productId} className="transition-colors border-b border-cyan-900/10 hover:bg-cyan-950/30">
                      <TableCell>
                        <div className="font-bold text-cyan-300 text-sm uppercase">{item.name}</div>
                        <div className="text-[10px] tracking-widest text-cyan-600/70 font-mono">{item.sku}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-cyan-100">{item.quantitySold}</TableCell>
                      <TableCell className="text-right text-cyan-400 font-bold font-mono">${item.totalSalesValue?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="rounded-none border border-cyan-900/50 bg-black/80 shadow-[0_0_15px_rgba(6,182,212,0.05)] overflow-hidden relative group">
          <div className="p-4 border-b border-cyan-900/50 bg-cyan-950/20">
            <h3 className="font-bold tracking-widest text-cyan-400 uppercase text-sm">SALES_BY_CATEGORY</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-cyan-950/10">
                <TableRow className="border-b border-cyan-900/50 hover:bg-transparent">
                  <TableHead className="text-cyan-500 text-[10px] tracking-widest uppercase">CLASS_ID</TableHead>
                  <TableHead className="text-right text-cyan-500 text-[10px] tracking-widest uppercase">QTY_SOLD</TableHead>
                  <TableHead className="text-right text-cyan-500 text-[10px] tracking-widest uppercase">REVENUE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                    <TableCell colSpan={3} className="text-center p-8">
                      <div className="inline-block text-cyan-500 animate-pulse tracking-widest text-xs">ANALYZING_CATEGORIES...</div>
                    </TableCell>
                  </TableRow>
                ) : !report?.salesByCategory || report.salesByCategory.length === 0 ? (
                  <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                    <TableCell colSpan={3} className="text-center p-8 text-cyan-700 text-xs tracking-widest uppercase">NO_CATEGORY_DATA_FOUND.</TableCell>
                  </TableRow>
                ) : (
                  report.salesByCategory.map((item) => (
                    <TableRow key={item.name} className="transition-colors border-b border-cyan-900/10 hover:bg-cyan-950/30">
                      <TableCell className="font-bold text-cyan-300 text-xs uppercase tracking-widest">{item.name}</TableCell>
                      <TableCell className="text-right font-mono text-cyan-100">{item.quantitySold}</TableCell>
                      <TableCell className="text-right text-cyan-400 font-bold font-mono">${item.salesValue?.toLocaleString()}</TableCell>
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
