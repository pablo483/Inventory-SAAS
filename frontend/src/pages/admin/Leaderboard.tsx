import { useLeaderboard, type LeaderBoardEntry } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, TrendingUp, Package, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

function LeaderboardTable({ 
  title, 
  description, 
  icon: Icon, 
  data, 
  isLoading, 
  valuePrefix = '', 
  valueSuffix = '' 
}: {
  title: string;
  description: string;
  icon: any;
  data?: LeaderBoardEntry[];
  isLoading: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
}) {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Medal className="h-6 w-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />;
      case 2:
        return <Medal className="h-6 w-6 text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.8)]" />;
      case 3:
        return <Medal className="h-6 w-6 text-orange-600 drop-shadow-[0_0_8px_rgba(234,88,12,0.8)]" />;
      default:
        return <span className="font-bold text-cyan-700 w-6 text-center inline-block">#{rank}</span>;
    }
  };

  return (
    <Card className="h-full border-none shadow-[0_0_30px_rgba(6,182,212,0.05)] bg-black/80 rounded-none relative overflow-hidden group">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500"></div>

      <CardHeader className="pb-4 border-b border-cyan-900/50 bg-cyan-950/20">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-950/50 text-cyan-500 border border-cyan-900/50">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-sm tracking-widest text-cyan-400 uppercase font-mono">{title}</CardTitle>
            <CardDescription className="text-xs text-cyan-600/70 font-mono uppercase tracking-wider">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 font-mono">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="text-cyan-500 animate-pulse tracking-widest text-xs">CALCULATING STANDINGS...</div>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center p-12 text-cyan-700 text-xs tracking-widest">
            INSUFFICIENT_DATA.
          </div>
        ) : (
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                  <TableHead className="w-[80px] text-center text-cyan-600 text-xs tracking-widest">RANK</TableHead>
                  <TableHead className="text-cyan-600 text-xs tracking-widest">TENANT_ID</TableHead>
                  <TableHead className="text-right text-cyan-600 text-xs tracking-widest">METRIC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((entry, idx) => (
                  <TableRow 
                    key={entry.tenantId}
                    className={cn(
                      "transition-colors border-b border-cyan-900/10 hover:bg-cyan-950/30",
                      idx < 3 && "bg-cyan-950/10"
                    )}
                  >
                    <TableCell className="text-center font-medium">
                      <div className="flex justify-center items-center">
                        {getRankBadge(idx + 1)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-cyan-100 uppercase">{entry.companyName}</span>
                        <span className="text-[10px] text-cyan-600/70">{entry.tenantId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center px-2 py-0.5 border border-cyan-500/50 bg-cyan-950/50 text-cyan-400 text-xs font-bold tracking-widest">
                        {valuePrefix}{entry.score.toLocaleString()}{valueSuffix}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Leaderboard() {
  const { data: salesData, isLoading: isLoadingSales } = useLeaderboard('sales', 10);
  const { data: inventoryData, isLoading: isLoadingInventory } = useLeaderboard('inventory-value', 10);

  return (
    <div className="p-6 space-y-6 relative z-10 font-mono">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-cyan-900/50 pb-4">
        <div className="p-3 border border-amber-500/50 bg-amber-950/20 text-amber-400 rounded-none shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-widest text-amber-400 uppercase drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
            SYS.LEADERBOARD
          </h1>
          <p className="text-amber-500/50 mt-1 text-sm uppercase tracking-widest">
            GLOBAL TENANT PERFORMANCE MATRIX
          </p>
        </div>
      </div>

      {/* Leaderboard Grids */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <LeaderboardTable 
          title="SALES.VOLUME_MAX"
          description="HIGHEST TOTAL SALES RECORDED"
          icon={TrendingUp}
          data={salesData}
          isLoading={isLoadingSales}
          valuePrefix="$"
        />
        
        <LeaderboardTable 
          title="INVENTORY.VALUE_MAX"
          description="HIGHEST CURRENT STOCK VALUATION"
          icon={Package}
          data={inventoryData}
          isLoading={isLoadingInventory}
          valuePrefix="$"
        />
      </div>

    </div>
  );
}
