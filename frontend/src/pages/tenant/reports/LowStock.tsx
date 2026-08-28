import { useState } from 'react';
import { useLowStockReport, exportLowStockReport } from '@/hooks/useReports';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Download, ArrowDownCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LowStock() {
  const [threshold, setThreshold] = useState<number | undefined>(undefined);
  const { data: report, isLoading } = useLowStockReport(threshold);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportLowStockReport(threshold);
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
          <div className="p-3 border border-red-500/50 bg-red-950/20 text-red-400 rounded-none shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-widest text-red-400 uppercase drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              SYS.LOW_STOCK_REPORT
            </h1>
            <p className="text-red-600/70 mt-1 text-sm uppercase tracking-widest">
              CRITICAL INVENTORY ALERTS
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 border border-cyan-900/50 px-2 bg-black/60 h-9 rounded-none">
            <span className="text-[10px] uppercase tracking-widest text-cyan-600/70 whitespace-nowrap">THRESHOLD_OVERRIDE:</span>
            <Input 
              type="number" 
              placeholder="DEFAULT" 
              className="w-24 h-8 border-0 focus-visible:ring-0 shadow-none px-1 p-0 text-xs bg-transparent text-cyan-400 placeholder:text-cyan-800" 
              value={threshold === undefined ? '' : threshold}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : undefined;
                setThreshold(val);
              }}
            />
          </div>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || !report || report.items.length === 0} 
            className="rounded-none bg-cyan-950/30 text-cyan-400 border border-cyan-900/50 hover:bg-cyan-900/40 hover:text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)] transition-all whitespace-nowrap text-xs tracking-widest uppercase"
          >
            <Download className="mr-2 h-4 w-4" /> {isExporting ? 'EXPORTING...' : 'EXPORT_CSV'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/80 border border-red-900/50 p-6 rounded-none shadow-[0_0_15px_rgba(239,68,68,0.05)] relative group overflow-hidden flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-red-600/70">TOTAL_LOW_STOCK_ASSETS</p>
            <h2 className="text-4xl font-bold mt-1 text-red-400 font-mono drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
              {report?.totalLowStockProducts || 0}
            </h2>
          </div>
          <div className="h-16 w-16 bg-red-950/30 border border-red-500/30 flex items-center justify-center opacity-80 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-red-500/50 w-full"></div>
        </div>
        
        <div className="bg-black/80 border border-orange-900/50 p-6 rounded-none shadow-[0_0_15px_rgba(249,115,22,0.05)] relative group overflow-hidden flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-orange-600/70">TOTAL_VALUE_AT_RISK</p>
            <h2 className="text-4xl font-bold mt-1 text-orange-400 font-mono drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">
              ${report?.totalValueAtRisk?.toLocaleString() || '0.00'}
            </h2>
          </div>
          <div className="h-16 w-16 bg-orange-950/30 border border-orange-500/30 flex items-center justify-center opacity-80 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
            <ArrowDownCircle className="h-8 w-8 text-orange-500" />
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-orange-500/50 w-full"></div>
        </div>
      </div>

      <div className="rounded-none border border-cyan-900/50 bg-black/80 shadow-[0_0_15px_rgba(6,182,212,0.05)] overflow-hidden relative group">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/50"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/50"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/50"></div>

        <Table>
          <TableHeader className="bg-cyan-950/20">
            <TableRow className="border-b border-cyan-900/50 hover:bg-transparent">
              <TableHead className="text-cyan-500 text-[10px] tracking-widest uppercase">ASSET_ID</TableHead>
              <TableHead className="text-cyan-500 text-[10px] tracking-widest uppercase">PRODUCT_NAME</TableHead>
              <TableHead className="text-cyan-500 text-[10px] tracking-widest uppercase">CLASS_ID</TableHead>
              <TableHead className="text-right text-cyan-500 text-[10px] tracking-widest uppercase">CUR_STOCK</TableHead>
              <TableHead className="text-right text-cyan-500 text-[10px] tracking-widest uppercase">ALERT_THOLD</TableHead>
              <TableHead className="text-right text-red-500 text-[10px] tracking-widest uppercase">SHORTFALL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableCell colSpan={6} className="text-center p-8">
                  <div className="inline-block text-cyan-500 animate-pulse tracking-widest text-xs">SCANNING_INVENTORY...</div>
                </TableCell>
              </TableRow>
            ) : !report || report.items.length === 0 ? (
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableCell colSpan={6} className="text-center p-12 text-green-500 text-xs tracking-widest uppercase font-bold drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                  <AlertTriangle className="h-12 w-12 mx-auto text-green-900 mb-3" />
                  NO_LOW_STOCK_DETECTED. INVENTORY_HEALTHY.
                </TableCell>
              </TableRow>
            ) : (
              report.items.map((item) => (
                <TableRow key={item.productId} className="transition-colors border-b border-cyan-900/10 hover:bg-cyan-950/30">
                  <TableCell className="font-mono text-cyan-600/70 text-[10px] tracking-widest">{item.sku}</TableCell>
                  <TableCell className="font-bold text-cyan-300 text-sm uppercase">{item.name}</TableCell>
                  <TableCell className="text-cyan-600/70 text-[10px] tracking-widest uppercase">{item.categoryName || 'UNCLASSIFIED'}</TableCell>
                  <TableCell className="text-right font-bold text-red-400 font-mono">{item.currentStock}</TableCell>
                  <TableCell className="text-right text-cyan-600/70 font-mono">{item.minStockThreshold}</TableCell>
                  <TableCell className="text-right font-bold text-red-500 font-mono drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">-{item.shortFall}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
