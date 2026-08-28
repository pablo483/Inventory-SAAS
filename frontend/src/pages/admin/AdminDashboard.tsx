import { useGlobalMetrics } from '@/hooks/useGlobalMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, Package, UserPlus, FileText } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend } from 'recharts';

const COLORS = ['#06b6d4', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444']; // Cyan, Green, Amber, Blue, Red

export default function AdminDashboard() {
  const { data: metrics, isLoading, isError } = useGlobalMetrics();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12 relative z-10 font-mono">
        <p className="text-cyan-500 animate-pulse tracking-widest text-sm">FETCHING GLOBAL TELEMETRY...</p>
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="flex h-full items-center justify-center p-12 relative z-10 font-mono">
        <p className="text-red-500 font-medium tracking-widest text-sm">SYS.ERR: TELEMETRY FEED OFFLINE.</p>
      </div>
    );
  }

  // Format subscription plans for pie chart
  const planData = Object.entries(metrics.tenantsByPlan || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6 relative z-10 font-mono">
      <div className="border-b border-cyan-900/50 pb-4">
        <h1 className="text-3xl font-bold tracking-widest text-cyan-400">SYS.DASHBOARD</h1>
        <p className="text-cyan-600/70 mt-1 text-sm uppercase">GLOBAL PLATFORM TELEMETRY & METRICS</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Tenants */}
        <Card className="bg-black/80 border-cyan-900/50 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.05)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold tracking-widest text-cyan-500 uppercase">ACTIVE.TENANTS</CardTitle>
            <Building2 className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-300">{metrics.totalTenants}</div>
            <p className="text-[10px] text-cyan-600/70 tracking-widest mt-1">
              <span className="text-green-500">{metrics.totalActiveTenants} ONLINE</span> // <span className="text-red-500">{metrics.inactiveTenants} OFFLINE</span>
            </p>
          </CardContent>
        </Card>

        {/* Users */}
        <Card className="bg-black/80 border-cyan-900/50 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.05)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold tracking-widest text-cyan-500 uppercase">TOTAL.USERS</CardTitle>
            <Users className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-300">{metrics.totalUsers}</div>
            <p className="text-[10px] text-cyan-600/70 tracking-widest mt-1">
              {metrics.totalAdmins} ADMINS // {metrics.totalRegularUsers} USERS
            </p>
          </CardContent>
        </Card>

        {/* Sales */}
        <Card className="bg-black/80 border-cyan-900/50 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.05)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold tracking-widest text-cyan-500 uppercase">SYS.REVENUE</CardTitle>
            <DollarSign className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
              ${metrics.totalSystemSales?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-[10px] text-cyan-600/70 tracking-widest mt-1 uppercase">
              AGGREGATED NETWORK SALES
            </p>
          </CardContent>
        </Card>

        {/* Inventory Value */}
        <Card className="bg-black/80 border-cyan-900/50 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.05)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold tracking-widest text-cyan-500 uppercase">STOCK.VALUATION</CardTitle>
            <Package className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
              ${metrics.totalSystemInventoryValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-[10px] text-cyan-600/70 tracking-widest mt-1 uppercase">
              TOTAL ITEMS: {metrics.totalProducts}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Growth Stats */}
        <Card className="col-span-4 bg-black/80 border-cyan-900/50 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.05)]">
          <CardHeader className="border-b border-cyan-900/30">
            <CardTitle className="text-sm font-bold tracking-widest text-cyan-400 uppercase">NETWORK.GROWTH [30_DAYS]</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2 p-4 bg-cyan-950/20 border border-cyan-900/50 rounded-none">
                <div className="flex items-center text-[10px] tracking-widest text-cyan-500 uppercase">
                  <Building2 className="mr-2 h-3 w-3" />
                  NEW_TENANTS
                </div>
                <div className="text-3xl font-bold text-cyan-300">
                  +{metrics.newTenantsThisMonth}
                </div>
              </div>
              <div className="flex flex-col space-y-2 p-4 bg-green-950/20 border border-green-900/50 rounded-none">
                <div className="flex items-center text-[10px] tracking-widest text-green-500 uppercase">
                  <UserPlus className="mr-2 h-3 w-3" />
                  NEW_USERS
                </div>
                <div className="text-3xl font-bold text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.3)]">
                  +{metrics.newUsersThisMonths}
                </div>
              </div>
              <div className="flex flex-col space-y-2 p-4 bg-amber-950/20 border border-amber-900/50 rounded-none">
                <div className="flex items-center text-[10px] tracking-widest text-amber-500 uppercase">
                  <FileText className="mr-2 h-3 w-3" />
                  TX_VOLUME
                </div>
                <div className="text-3xl font-bold text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">
                  {metrics.totalStockTransactions?.toLocaleString() || 0}
                </div>
              </div>
              <div className="flex flex-col space-y-2 p-4 bg-indigo-950/20 border border-indigo-900/50 rounded-none">
                <div className="flex items-center text-[10px] tracking-widest text-indigo-400 uppercase">
                  <Package className="mr-2 h-3 w-3" />
                  SYS_CATEGORIES
                </div>
                <div className="text-3xl font-bold text-indigo-300 drop-shadow-[0_0_5px_rgba(99,102,241,0.3)]">
                  {metrics.totalCategories?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans Chart */}
        <Card className="col-span-3 bg-black/80 border-cyan-900/50 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.05)]">
          <CardHeader className="border-b border-cyan-900/30">
            <CardTitle className="text-sm font-bold tracking-widest text-cyan-400 uppercase">SUBSCRIPTION.DIST</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {planData.length > 0 ? (
              <div className="h-[250px] w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {planData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: 'rgba(6,182,212,0.5)', borderRadius: '0', color: '#cffafe', fontFamily: 'monospace', fontSize: '12px' }}
                      itemStyle={{ color: '#67e8f9' }}
                    />
                    <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '10px', color: '#06b6d4' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[250px] items-center justify-center">
                <p className="text-[10px] tracking-widest text-cyan-700 uppercase">NO_DATA_AVAILABLE</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
