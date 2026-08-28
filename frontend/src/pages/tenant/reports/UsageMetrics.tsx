import { useState } from 'react';
import { useUsageMetrics } from '@/hooks/useReports';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Calendar, HardDrive, MousePointerClick, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function UsageMetrics() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: metrics, isLoading } = useUsageMetrics(startDate, endDate);

  return (
    <div className="p-6 space-y-6 relative z-10 font-mono">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyan-900/50 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 border border-pink-500/50 bg-pink-950/20 text-pink-400 rounded-none shadow-[0_0_15px_rgba(236,72,153,0.2)]">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-widest text-pink-400 uppercase drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
              SYS.USAGE_METRICS
            </h1>
            <p className="text-pink-600/70 mt-1 text-sm uppercase tracking-widest">
              PLATFORM UTILIZATION & TELEMETRY
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/80 border border-cyan-900/50 p-6 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.05)] relative group overflow-hidden flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-cyan-600/70">TOTAL_API_CALLS</p>
            <h2 className="text-4xl font-bold mt-1 text-cyan-400 font-mono drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
              {metrics?.totalApiCalls?.toLocaleString() || 0}
            </h2>
          </div>
          <div className="h-16 w-16 bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-center opacity-80 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <MousePointerClick className="h-8 w-8 text-cyan-500" />
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-cyan-500/50 w-full"></div>
        </div>
        
        <div className="bg-black/80 border border-pink-900/50 p-6 rounded-none shadow-[0_0_15px_rgba(236,72,153,0.05)] relative group overflow-hidden flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-pink-600/70">STORAGE_CONSUMPTION_(MB)</p>
            <h2 className="text-4xl font-bold mt-1 text-pink-400 font-mono drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">
              {metrics?.totalStorageUsed?.toLocaleString() || 0}
            </h2>
          </div>
          <div className="h-16 w-16 bg-pink-950/30 border border-pink-500/30 flex items-center justify-center opacity-80 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
            <HardDrive className="h-8 w-8 text-pink-500" />
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-pink-500/50 w-full"></div>
        </div>
      </div>

      <div className="rounded-none border border-cyan-900/50 bg-black/80 shadow-[0_0_15px_rgba(6,182,212,0.05)] overflow-hidden relative group">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/50"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/50"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/50"></div>

        <div className="p-4 border-b border-cyan-900/50 bg-cyan-950/20 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-cyan-500" />
          <h3 className="font-bold tracking-widest text-cyan-400 uppercase text-sm">DAILY_TELEMETRY</h3>
        </div>
        
        <Table>
          <TableHeader className="bg-cyan-950/10">
            <TableRow className="border-b border-cyan-900/50 hover:bg-transparent">
              <TableHead className="text-cyan-500 text-[10px] tracking-widest uppercase">TIMESTAMP</TableHead>
              <TableHead className="text-right text-cyan-500 text-[10px] tracking-widest uppercase">API_REQS</TableHead>
              <TableHead className="text-right text-pink-500 text-[10px] tracking-widest uppercase">STORAGE_(MB)</TableHead>
              <TableHead className="text-right text-emerald-500 text-[10px] tracking-widest uppercase">SALES_VOL</TableHead>
              <TableHead className="text-right text-cyan-500 text-[10px] tracking-widest uppercase">INV_VALUE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableCell colSpan={5} className="text-center p-8">
                  <div className="inline-block text-cyan-500 animate-pulse tracking-widest text-xs">ANALYZING_TELEMETRY...</div>
                </TableCell>
              </TableRow>
            ) : !metrics?.dailyMetrics || metrics.dailyMetrics.length === 0 ? (
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableCell colSpan={5} className="text-center p-12 text-cyan-700 text-xs tracking-widest uppercase">
                  <Activity className="h-12 w-12 mx-auto text-cyan-900 mb-3" />
                  NO_TELEMETRY_DATA_FOUND.
                </TableCell>
              </TableRow>
            ) : (
              metrics.dailyMetrics.map((day) => (
                <TableRow key={day.date} className="transition-colors border-b border-cyan-900/10 hover:bg-cyan-950/30">
                  <TableCell className="font-mono text-cyan-600/70 text-[10px] tracking-widest">{day.date}</TableCell>
                  <TableCell className="text-right font-mono text-cyan-300">{day.apiCalls}</TableCell>
                  <TableCell className="text-right font-mono text-pink-400">{day.storageUsed}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-emerald-400">${day.sales?.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-cyan-600/70">${day.inventoryValue?.toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
