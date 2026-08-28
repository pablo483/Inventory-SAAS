import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth, type Role } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Users, 
  LogOut, 
  Menu,
  X,
  Building2,
  Trophy,
  Activity,
  History,
  AlertTriangle,
  BarChart3,
  Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- MICRO-AUDIO ENGINE ---
const AudioEngine = {
  playTick: () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(3000, ctx.currentTime);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch(e) {}
  }
};

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
}

const navItems: NavItem[] = [
  // Common / Tenant Dashboard
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['TENANT_ADMIN', 'TENANT_USER'] },
  
  // Tenant Admin & User routes
  { title: 'Products', href: '/products', icon: Package, roles: ['TENANT_ADMIN', 'TENANT_USER'] },
  { title: 'Categories', href: '/categories', icon: FolderTree, roles: ['TENANT_ADMIN', 'TENANT_USER'] },
  { title: 'Suppliers', href: '/suppliers', icon: Users, roles: ['TENANT_ADMIN', 'TENANT_USER'] },
  { title: 'Transactions', href: '/inventory/transactions', icon: History, roles: ['TENANT_ADMIN', 'TENANT_USER'] },
  { title: 'Low Stock', href: '/reports/low-stock', icon: AlertTriangle, roles: ['TENANT_ADMIN', 'TENANT_USER'] },
  { title: 'Sales Summary', href: '/reports/sales-summary', icon: BarChart3, roles: ['TENANT_ADMIN', 'TENANT_USER'] },
  { title: 'Usage Metrics', href: '/reports/usage', icon: Activity, roles: ['TENANT_ADMIN'] },
  { title: 'Reconciliation', href: '/reports/reconciliation', icon: Scale, roles: ['TENANT_ADMIN'] },
  { title: 'Leaderboard', href: '/leaderboard', icon: Trophy, roles: ['TENANT_ADMIN'] },
  { title: 'Users', href: '/users', icon: Users, roles: ['TENANT_ADMIN'] },

  // Super Admin routes
  { title: 'Platform Admin', href: '/admin', icon: LayoutDashboard, roles: ['SUPER_ADMIN'] },
  { title: 'Tenants', href: '/admin/tenants', icon: Building2, roles: ['SUPER_ADMIN'] },
  { title: 'All Users', href: '/admin/users', icon: Users, roles: ['SUPER_ADMIN'] },
  { title: 'Leaderboards', href: '/admin/leaderboard', icon: Trophy, roles: ['SUPER_ADMIN'] },
  { title: 'System Health', href: '/admin/health', icon: Activity, roles: ['SUPER_ADMIN'] },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const NavLinks = () => (
    <>
      {visibleNavItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          end={item.href === '/admin' || item.href === '/dashboard'}
          onClick={() => setIsMobileOpen(false)}
          onMouseEnter={AudioEngine.playTick}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-none px-3 py-2 text-sm font-medium font-mono transition-all duration-75 border-l-2 ${
              isActive 
                ? 'bg-cyan-900/40 text-cyan-300 border-green-500 shadow-[inset_15px_0_20px_-15px_rgba(34,197,94,0.3)]' 
                : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:border-cyan-500/50'
            }`
          }
        >
          <item.icon className={`h-4 w-4 ${location.pathname.startsWith(item.href) ? 'text-green-400' : ''}`} />
          {item.title}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-950 text-slate-200 md:flex-row relative overflow-hidden">
      
      {/* 1. Circuit Board / Micro-wire Animated Background */}
      <style>{`
        @keyframes flowLight {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }
        .pcb-wire {
          fill: none;
          stroke: rgba(6, 182, 212, 0.15);
          stroke-width: 1.5;
        }
        .pcb-data {
          fill: none;
          stroke: rgba(34, 197, 94, 1);
          stroke-width: 2.5;
          stroke-dasharray: 15 985;
          animation: flowLight linear infinite;
          filter: drop-shadow(0 0 4px rgba(34,197,94,0.8));
        }
        .pcb-node {
          fill: rgba(6, 182, 212, 0.3);
          stroke: rgba(6, 182, 212, 0.6);
          stroke-width: 1;
        }
      `}</style>
      
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50 mix-blend-screen overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="circuit-pattern" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse">
            {/* Base Wires */}
            <path className="pcb-wire" d="M 0 50 L 120 50 L 150 80 L 300 80" />
            <path className="pcb-wire" d="M 80 0 L 80 120 L 100 140 L 100 300" />
            <path className="pcb-wire" d="M 0 200 L 60 200 L 90 230 L 300 230" />
            <path className="pcb-wire" d="M 220 0 L 220 70 L 250 100 L 250 300" />
            <path className="pcb-wire" d="M 150 80 L 220 150" />
            <path className="pcb-wire" d="M 100 140 L 50 190" />
            
            {/* Nodes */}
            <circle className="pcb-node" cx="120" cy="50" r="4" />
            <circle className="pcb-node" cx="150" cy="80" r="4" />
            <circle className="pcb-node" cx="80" cy="120" r="4" />
            <circle className="pcb-node" cx="100" cy="140" r="4" />
            <circle className="pcb-node" cx="60" cy="200" r="4" />
            <circle className="pcb-node" cx="90" cy="230" r="4" />
            <circle className="pcb-node" cx="220" cy="70" r="4" />
            <circle className="pcb-node" cx="250" cy="100" r="4" />
            <circle className="pcb-node" cx="220" cy="150" r="4" />
            <circle className="pcb-node" cx="50" cy="190" r="4" />
            
            {/* Animated Data Packets (flowing along the paths) */}
            <path className="pcb-data" d="M 0 50 L 120 50 L 150 80 L 300 80" style={{animationDuration: '4s', animationDelay: '0s'}} />
            <path className="pcb-data" d="M 80 0 L 80 120 L 100 140 L 100 300" style={{animationDuration: '5.5s', animationDelay: '1.2s'}} />
            <path className="pcb-data" d="M 0 200 L 60 200 L 90 230 L 300 230" style={{animationDuration: '4.8s', animationDelay: '2.5s'}} />
            <path className="pcb-data" d="M 220 0 L 220 70 L 250 100 L 250 300" style={{animationDuration: '3.5s', animationDelay: '0.8s'}} />
            <path className="pcb-data" d="M 150 80 L 220 150" style={{animationDuration: '3s', animationDelay: '3s'}} />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#circuit-pattern)" />
          {/* Subtle radial vignette to darken edges of the grid */}
          <rect x="0" y="0" width="100%" height="100%" fill="url(#vignette)" opacity="0.8" />
          <defs>
            <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
              <stop offset="50%" stopColor="transparent" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 flex-col border-r border-cyan-900/30 bg-black/60 backdrop-blur-2xl md:flex h-screen sticky top-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="flex h-14 items-center border-b border-cyan-900/30 px-4 lg:h-[60px] lg:px-6 shrink-0 bg-slate-900/40">
          <NavLink to="/" className="flex items-center gap-2 font-bold font-mono tracking-wider text-cyan-400" onMouseEnter={AudioEngine.playTick}>
            <div className="relative">
              <Package className="h-6 w-6 text-green-500 relative z-10" />
              <div className="absolute inset-0 bg-green-500/20 blur-md rounded-full" />
            </div>
            <span>SYS.CORE</span>
          </NavLink>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-2 text-sm font-medium lg:px-4">
            <NavLinks />
          </nav>
        </div>
        <div className="shrink-0 p-4 border-t border-cyan-900/30 bg-slate-900/40">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-cyan-950 border border-cyan-800">
              <span className="text-sm font-bold text-cyan-400 font-mono">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex flex-col overflow-hidden font-mono">
              <span className="text-sm font-medium truncate text-slate-200">{user?.username || 'Unknown'}</span>
              <span className="text-[10px] text-green-400 truncate tracking-widest">{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start font-mono text-xs tracking-widest border-red-900/50 hover:bg-red-950/50 hover:text-red-400 text-slate-400" 
            onClick={handleLogout}
            onMouseEnter={AudioEngine.playTick}
          >
            <LogOut className="mr-2 h-4 w-4" />
            DISCONNECT
          </Button>
        </div>
      </aside>

      {/* Mobile Topbar & Drawer (Sci-fi themed) */}
      <div className="flex flex-col flex-1 md:hidden z-10 relative">
        <header className="flex h-14 items-center gap-4 border-b border-cyan-900/30 bg-black/80 backdrop-blur-xl px-4 shrink-0">
          <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-cyan-400" onClick={() => setIsMobileOpen(true)}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          <div className="font-bold font-mono tracking-wider text-cyan-400 flex items-center gap-2">
            <Package className="h-5 w-5 text-green-500" />
            <span>SYS.CORE</span>
          </div>
        </header>
        
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden">
            <div className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm border-r border-cyan-900/30 bg-slate-950 shadow-lg transition ease-in-out duration-200 flex flex-col">
              <div className="flex h-14 items-center justify-between px-4 border-b border-cyan-900/30 shrink-0 bg-slate-900/40">
                <span className="text-sm font-bold font-mono text-cyan-400 tracking-widest">MENU.EXE</span>
                <Button variant="ghost" size="icon" className="text-cyan-400" onClick={() => setIsMobileOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-2">
                  <NavLinks />
                </nav>
              </div>
              <div className="shrink-0 p-4 border-t border-cyan-900/30 bg-slate-900/40">
                <Button variant="outline" className="w-full justify-start font-mono text-xs tracking-widest border-red-900/50 text-red-400" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  DISCONNECT
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 relative z-10">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Desktop Main Content Area */}
      <main className="hidden md:flex flex-1 overflow-y-auto p-6 lg:p-8 relative z-10">
        <div className="mx-auto max-w-7xl w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
