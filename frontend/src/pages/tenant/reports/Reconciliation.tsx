import { useState } from 'react';
import { useReconciliation, useProductReconciliation } from '@/hooks/useInventory';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Reconciliation() {
  const [productIdInput, setProductIdInput] = useState('');
  const [activeProductId, setActiveProductId] = useState<number | null>(null);

  const { data: allReconciliationData, isLoading: isLoadingAll } = useReconciliation();
  const { data: specificData, isLoading: isLoadingSpecific } = useProductReconciliation(activeProductId);

  const summary = activeProductId ? (specificData ? [specificData] : []) : (allReconciliationData || []);
  const isLoading = activeProductId ? isLoadingSpecific : isLoadingAll;

  const totalProducts = summary.length;
  const reconciledProducts = summary.filter(s => s.isReconciled).length;
  const discrepancies = totalProducts - reconciledProducts;

  return (
    <div className="p-6 space-y-6 relative z-10 font-mono">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyan-900/50 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 border border-purple-500/50 bg-purple-950/20 text-purple-400 rounded-none shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-widest text-purple-400 uppercase drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
              SYS.STOCK_RECONCILIATION
            </h1>
            <p className="text-purple-600/70 mt-1 text-sm uppercase tracking-widest">
              VERIFY PHYSICAL VS CALCULATED STOCK LEVELS
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Input 
            placeholder="PRODUCT_ID_TO_VERIFY..." 
            value={productIdInput}
            onChange={(e) => setProductIdInput(e.target.value)}
            className="w-48 bg-black/60 border-cyan-900/50 rounded-none text-cyan-200 placeholder:text-cyan-600/50 focus-visible:ring-cyan-500/30 uppercase text-xs tracking-widest"
          />
          <Button 
            onClick={() => {
              const id = parseInt(productIdInput);
              if (!isNaN(id)) {
                setActiveProductId(id);
              }
            }}
            className="rounded-none bg-cyan-950/30 text-cyan-400 border border-cyan-900/50 hover:bg-cyan-900/40 hover:text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)] transition-all whitespace-nowrap text-xs tracking-widest uppercase"
          >
            VERIFY
          </Button>
          {activeProductId !== null && (
            <Button 
              variant="ghost" 
              onClick={() => { setActiveProductId(null); setProductIdInput(''); }}
              className="rounded-none text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-all whitespace-nowrap text-xs tracking-widest uppercase"
            >
              [CLEAR]
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-black/80 border border-cyan-900/50 p-6 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.05)] relative group overflow-hidden flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-cyan-600/70">TOTAL_PRODUCTS_CHECKED</p>
            <h2 className="text-4xl font-bold mt-1 text-cyan-400 font-mono drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
              {totalProducts}
            </h2>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-cyan-500/50 w-full"></div>
        </div>
        
        <div className="bg-black/80 border border-emerald-900/50 p-6 rounded-none shadow-[0_0_15px_rgba(16,185,129,0.05)] relative group overflow-hidden flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-emerald-600/70">PERFECTLY_RECONCILED</p>
            <h2 className="text-4xl font-bold mt-1 text-emerald-400 font-mono drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
              {reconciledProducts}
            </h2>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-emerald-500/50 w-full"></div>
        </div>
        
        <div className="bg-black/80 border border-red-900/50 p-6 rounded-none shadow-[0_0_15px_rgba(239,68,68,0.05)] relative group overflow-hidden flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-red-600/70">DISCREPANCIES_FOUND</p>
            <h2 className="text-4xl font-bold mt-1 text-red-400 font-mono drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
              {discrepancies}
            </h2>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-red-500/50 w-full"></div>
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
              <TableHead className="text-cyan-500 text-[10px] tracking-widest uppercase">STATUS</TableHead>
              <TableHead className="text-cyan-500 text-[10px] tracking-widest uppercase">SKU</TableHead>
              <TableHead className="text-cyan-500 text-[10px] tracking-widest uppercase">PRODUCT_NAME</TableHead>
              <TableHead className="text-center text-cyan-500 text-[10px] tracking-widest uppercase">STOCK_IN</TableHead>
              <TableHead className="text-center text-cyan-500 text-[10px] tracking-widest uppercase">STOCK_OUT</TableHead>
              <TableHead className="text-right text-cyan-500 text-[10px] tracking-widest uppercase">CALCULATED_STOCK</TableHead>
              <TableHead className="text-right text-cyan-500 text-[10px] tracking-widest uppercase">CURRENT_STOCK_DB</TableHead>
              <TableHead className="text-right text-cyan-500 text-[10px] tracking-widest uppercase">TOTAL_VALUE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableCell colSpan={8} className="text-center p-8">
                  <div className="inline-block text-cyan-500 animate-pulse tracking-widest text-xs">ANALYZING_SYSTEM_DATA...</div>
                </TableCell>
              </TableRow>
            ) : summary.length === 0 ? (
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableCell colSpan={8} className="text-center p-12 text-cyan-700 text-xs tracking-widest uppercase">
                  <Scale className="h-12 w-12 mx-auto text-cyan-900 mb-3" />
                  NO_DATA_TO_RECONCILE.
                </TableCell>
              </TableRow>
            ) : (
              summary.map((item) => (
                <TableRow key={item.productId} className={cn(
                  "transition-colors border-b border-cyan-900/10 hover:bg-cyan-950/30",
                  !item.isReconciled && "bg-red-950/20"
                )}>
                  <TableCell>
                    {item.isReconciled ? (
                      <Badge variant="outline" className="rounded-none bg-emerald-950/30 text-emerald-400 border-emerald-900/50 uppercase tracking-widest text-[10px]">
                        <ShieldCheck className="w-3 h-3 mr-1" /> OK
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-none bg-red-950/30 text-red-400 border-red-900/50 uppercase tracking-widest text-[10px]">
                        <ShieldAlert className="w-3 h-3 mr-1" /> MISMATCH
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-cyan-600/70 text-[10px] tracking-widest">{item.sku}</TableCell>
                  <TableCell className="font-bold text-cyan-300 text-sm uppercase">{item.name}</TableCell>
                  <TableCell className="text-center font-mono font-bold text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">+{item.totalStockIn}</TableCell>
                  <TableCell className="text-center font-mono font-bold text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">-{item.totalStockOut}</TableCell>
                  <TableCell className="text-right font-mono text-cyan-400">{item.calculatedStock}</TableCell>
                  <TableCell className={cn(
                    "text-right font-mono font-bold",
                    item.isReconciled ? "text-cyan-400" : "text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]"
                  )}>
                    {item.currentStock}
                  </TableCell>
                  <TableCell className="text-right font-mono text-cyan-600/70">
                    ${item.totalValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
