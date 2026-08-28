import { useSystemHealth } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Server, Database, HardDrive, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Health() {
  const { data: health, isLoading, isError } = useSystemHealth();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center relative z-10 font-mono">
        <div className="text-cyan-500 animate-pulse tracking-widest text-sm">INITIATING HEALTH DIAGNOSTICS...</div>
      </div>
    );
  }

  if (isError || !health) {
    return (
      <div className="flex h-full items-center justify-center text-red-500 relative z-10 font-mono flex-col gap-4">
        <XCircle className="h-12 w-12 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse" />
        <h2 className="text-lg font-bold tracking-widest">SYS.ERR: DIAGNOSTIC FEED OFFLINE</h2>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UP':
        return 'text-green-400 bg-green-950/20 border-green-500/50 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]';
      case 'DOWN':
        return 'text-red-400 bg-red-950/20 border-red-500/50 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]';
      case 'DEGRADED':
        return 'text-amber-400 bg-amber-950/20 border-amber-500/50 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]';
      default:
        return 'text-cyan-600 bg-cyan-950/20 border-cyan-900/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UP':
        return <CheckCircle2 className="h-5 w-5 text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]" />;
      case 'DOWN':
        return <XCircle className="h-5 w-5 text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)] animate-pulse" />;
      case 'DEGRADED':
        return <AlertTriangle className="h-5 w-5 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" />;
      default:
        return <Activity className="h-5 w-5 text-cyan-600" />;
    }
  };

  const getComponentIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('database') || n.includes('db') || n.includes('mysql')) return <Database className="h-5 w-5" />;
    if (n.includes('redis') || n.includes('cache')) return <Server className="h-5 w-5" />;
    if (n.includes('disk') || n.includes('space')) return <HardDrive className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };

  return (
    <div className="p-6 space-y-6 relative z-10 font-mono">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyan-900/50 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 border border-cyan-500/50 bg-cyan-950/20 text-cyan-400 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-widest text-cyan-400 uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              SYS.HEALTH_MONITOR
            </h1>
            <p className="text-cyan-600/70 mt-1 flex items-center gap-2 text-xs uppercase tracking-widest">
              <Clock className="h-3 w-3" />
              LAST_SYNC: {new Date(health.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={cn("px-4 py-1.5 text-xs font-bold rounded-none uppercase tracking-widest border border-cyan-500/50", getStatusColor(health.status))}
        >
          {health.status === 'UP' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse shadow-[0_0_5px_rgba(34,197,94,1)]" />}
          GLOBAL_STATE: {health.status}
        </Badge>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(health.components).map(([name, component]) => (
          <Card 
            key={name} 
            className="bg-black/80 border-cyan-900/50 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.05)] relative overflow-hidden group"
          >
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/30"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/30"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/30"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/30"></div>
            
            {/* Scan line effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[10%] w-full opacity-0 group-hover:opacity-100 group-hover:animate-[scan_2s_ease-in-out_infinite]" />

            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-cyan-900/30 bg-cyan-950/10">
              <div className="flex items-center gap-3">
                <div className="p-2 border border-cyan-900/50 bg-cyan-950/50 text-cyan-500">
                  {getComponentIcon(name)}
                </div>
                <CardTitle className="text-sm font-bold tracking-widest text-cyan-400 uppercase">
                  {name}
                </CardTitle>
              </div>
              {getStatusIcon(component.status)}
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-cyan-600/70 tracking-widest uppercase">STATE</span>
                  <Badge variant="outline" className={cn("rounded-none px-2 py-0 border", getStatusColor(component.status))}>
                    {component.status}
                  </Badge>
                </div>
                
                {component.description && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-cyan-600/70 tracking-widest uppercase">INFO</span>
                    <span className="font-bold text-cyan-200">
                      {component.description}
                    </span>
                  </div>
                )}

                {component.responseTimeMs !== undefined && component.responseTimeMs !== null && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-cyan-600/70 tracking-widest uppercase">LATENCY</span>
                    <span className="font-bold text-cyan-400 bg-cyan-950/50 border border-cyan-900/50 px-2 py-0.5 rounded-none">
                      {component.responseTimeMs}ms
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
