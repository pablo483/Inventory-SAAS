import { useTenants } from '@/hooks/useTenants';
import { useActivateTenant, useDeactivateTenant } from '@/hooks/useSuperAdmin';
import { CreateTenantModal } from '@/components/admin/CreateTenantModal';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Power, PowerOff, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Tenants() {
  const { data: tenants, isLoading, isError } = useTenants();
  const activateTenant = useActivateTenant();
  const deactivateTenant = useDeactivateTenant();
  const { toast } = useToast();

  const handleActivate = (tenantId: string) => {
    activateTenant.mutate(tenantId, {
      onSuccess: () => toast({ title: 'Success', description: 'Tenant activated successfully.' }),
      onError: (err: any) => toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed to activate tenant.' }),
    });
  };

  const handleDeactivate = (tenantId: string) => {
    deactivateTenant.mutate(tenantId, {
      onSuccess: () => toast({ title: 'Success', description: 'Tenant deactivated successfully.' }),
      onError: (err: any) => toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed to deactivate tenant.' }),
    });
  };

  if (isLoading) return <div className="p-8 text-center text-cyan-500 font-mono animate-pulse relative z-10">SCANNING NETWORK FOR TENANTS...</div>;
  if (isError) return <div className="p-8 text-center text-red-500 font-mono relative z-10">SYS.ERR: FAILED TO LOAD TENANT DATA.</div>;

  return (
    <div className="p-6 space-y-6 relative z-10 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-900/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-widest text-cyan-400">SYS.TENANTS</h1>
          <p className="text-cyan-600/70 mt-1 text-sm uppercase">MANAGE PLATFORM TENANTS & SUBSCRIPTIONS</p>
        </div>
        <CreateTenantModal />
      </div>

      <div className="rounded-none border border-cyan-900/50 bg-black/80 shadow-[0_0_30px_rgba(6,182,212,0.05)] overflow-hidden flex flex-col relative group">
        <div className="p-4 border-b border-cyan-900/50 bg-cyan-950/20 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-cyan-500" />
          <h3 className="font-bold text-sm text-cyan-500 tracking-widest uppercase">REGISTRY // TENANTS</h3>
        </div>
        <div className="flex-1 overflow-auto p-2">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableHead className="text-cyan-600 text-xs tracking-widest">TENANT.ID</TableHead>
                <TableHead className="text-cyan-600 text-xs tracking-widest">COMPANY</TableHead>
                <TableHead className="text-cyan-600 text-xs tracking-widest">CONTACT</TableHead>
                <TableHead className="text-cyan-600 text-xs tracking-widest">TIER</TableHead>
                <TableHead className="text-cyan-600 text-xs tracking-widest">STATUS</TableHead>
                <TableHead className="text-cyan-600 text-xs tracking-widest">INIT.DATE</TableHead>
                <TableHead className="text-cyan-600 text-xs tracking-widest text-right">EXEC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants?.length === 0 ? (
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell colSpan={7} className="text-center py-8 text-cyan-700">
                    NO_TENANTS_FOUND.
                  </TableCell>
                </TableRow>
              ) : (
                tenants?.map((tenant: any) => (
                  <TableRow key={tenant.id} className="border-b border-cyan-900/10 hover:bg-cyan-950/30 transition-colors">
                    <TableCell className="text-cyan-300 text-xs">{tenant.tenantId}</TableCell>
                    <TableCell className="font-medium text-cyan-100">{tenant.companyName}</TableCell>
                    <TableCell className="text-cyan-400/70 text-xs">{tenant.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 border text-[10px] font-bold uppercase tracking-widest ${
                        tenant.subscriptionPlan === 'ENTERPRISE' 
                          ? 'border-amber-500 text-amber-400 bg-amber-950/50' 
                          : 'border-cyan-500 text-cyan-400 bg-cyan-950/50'
                      }`}>
                        {tenant.subscriptionPlan}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 border text-[10px] font-bold uppercase tracking-widest ${
                        tenant.isActive 
                          ? 'border-green-500 text-green-400 bg-green-950/50' 
                          : 'border-red-500 text-red-400 bg-red-950/50'
                      }`}>
                        {tenant.isActive ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </TableCell>
                    <TableCell className="text-cyan-700 text-xs">
                      {new Date(tenant.createdAt).toISOString().slice(0, 10)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-cyan-500 hover:text-cyan-300 hover:bg-cyan-900/30 rounded-none">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-black/90 border-cyan-900/50 text-cyan-100 font-mono rounded-none">
                          <DropdownMenuLabel className="text-xs tracking-widest text-cyan-600">ACTIONS</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-cyan-900/30" />
                          {!tenant.isActive ? (
                            <DropdownMenuItem onClick={() => handleActivate(tenant.tenantId)} className="text-green-400 hover:bg-green-900/30 hover:text-green-300 cursor-pointer focus:bg-green-900/30 focus:text-green-300">
                              <Power className="mr-2 h-4 w-4" />
                              <span className="text-xs tracking-wider">ACTIVATE</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleDeactivate(tenant.tenantId)} className="text-red-400 hover:bg-red-900/30 hover:text-red-300 cursor-pointer focus:bg-red-900/30 focus:text-red-300">
                              <PowerOff className="mr-2 h-4 w-4" />
                              <span className="text-xs tracking-wider">DEACTIVATE</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
