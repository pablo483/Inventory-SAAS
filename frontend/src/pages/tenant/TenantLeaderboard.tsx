import { useMyRank } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, Package, Medal, AlertCircle } from 'lucide-react';

function RankCard({
  title,
  description,
  rank,
  score,
  icon: Icon,
  scorePrefix = '',
  scoreSuffix = '',
  loading = false,
}: {
  title: string;
  description: string;
  rank?: number;
  score?: number;
  icon: any;
  scorePrefix?: string;
  scoreSuffix?: string;
  loading?: boolean;
}) {
  return (
    <Card className="bg-black/80 border-cyan-900/50 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.05)] overflow-hidden relative group">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/30"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/30"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/30"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/30"></div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-900/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
      <CardHeader className="pb-4 border-b border-cyan-900/30 bg-cyan-950/10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-950/50 text-cyan-500 border border-cyan-900/50">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold tracking-widest text-cyan-400 uppercase">{title}</CardTitle>
            <CardDescription className="text-[10px] tracking-widest uppercase text-cyan-600/70">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-4 flex flex-col gap-4 font-mono">
        {loading ? (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-8 bg-cyan-950/50 border border-cyan-900/30 w-1/3"></div>
            <div className="h-4 bg-cyan-950/50 border border-cyan-900/30 w-1/2"></div>
          </div>
        ) : (
          <>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-cyan-600/70 mb-1">GLOBAL_RANK</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                  {rank !== undefined && rank !== null && rank > 0 ? `#${rank}` : 'UNRANKED'}
                </span>
                {rank === 1 && <Medal className="h-6 w-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />}
                {rank === 2 && <Medal className="h-6 w-6 text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.8)]" />}
                {rank === 3 && <Medal className="h-6 w-6 text-orange-600 drop-shadow-[0_0_8px_rgba(234,88,12,0.8)]" />}
              </div>
            </div>
            <div className="bg-cyan-950/20 p-4 border border-cyan-900/50 rounded-none relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
              <p className="text-[10px] tracking-widest uppercase text-cyan-600/70 mb-1">METRIC_SCORE</p>
              <p className="text-2xl font-bold text-cyan-300">
                {scorePrefix}
                {score?.toLocaleString() ?? 0}
                {scoreSuffix}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function TenantLeaderboard() {
  const { data: rankData, isLoading, isError } = useMyRank();

  return (
    <div className="p-6 space-y-6 relative z-10 font-mono">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-cyan-900/50 pb-4">
        <div className="p-3 border border-amber-500/50 bg-amber-950/20 text-amber-400 rounded-none shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-widest text-amber-400 uppercase drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
            LOCAL.RANKING
          </h1>
          <p className="text-amber-500/50 mt-1 text-sm uppercase tracking-widest">
            TENANT PERFORMANCE METRICS VS GLOBAL PLATFORM
          </p>
        </div>
      </div>

      {isError ? (
        <Card className="bg-red-950/20 border-red-900/50 rounded-none">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="h-8 w-8 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <div className="text-red-400 font-mono">
              <p className="font-bold tracking-widest text-sm">SYS.ERR: RANK_DATA_UNAVAILABLE</p>
              <p className="text-xs uppercase tracking-widest mt-1 opacity-70">CONNECTION TO LEADERBOARD SERVICE FAILED.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RankCard
            title="SALES.VOLUME_RANK"
            description="POSITION BASED ON TOTAL SALES"
            icon={TrendingUp}
            rank={rankData?.salesRank}
            score={rankData?.salesScore}
            scorePrefix="$"
            loading={isLoading}
          />
          <RankCard
            title="INVENTORY.VALUE_RANK"
            description="POSITION BASED ON STOCK VALUATION"
            icon={Package}
            rank={rankData?.inventoryRank}
            score={rankData?.inventoryScore}
            scorePrefix="$"
            loading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
