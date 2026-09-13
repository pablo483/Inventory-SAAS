import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  tenantId: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type VideoSequenceState = 'pre_playing' | 'form_visible' | 'post_playing';

// --- 5. AUDIO ENGINE ---
const AudioEngine = {
  playBeep: () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch(e) {}
  },
  playAccessGranted: () => {
     try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime); 
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); 
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch(e) {}
  }
};

// --- 4. TYPING EFFECT HOOK ---
function useTypingEffect(text: string, isVisible: boolean, speed = 40) {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    if (!isVisible) { setDisplayedText(''); return; }
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, isVisible, speed]);
  return displayedText;
}

// --- 2. HUD OVERLAY COMPONENT ---
function HudOverlay({ visible }: { visible: boolean }) {
  const [hex1, setHex1] = useState('0x0000');
  const [hex2, setHex2] = useState('0x0000');

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setHex1('0x' + Math.floor(Math.random()*16777215).toString(16).toUpperCase().padStart(4, '0'));
      setHex2('0x' + Math.floor(Math.random()*16777215).toString(16).toUpperCase().padStart(4, '0'));
    }, 150);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 font-mono text-cyan-400 opacity-70 text-xs">
      <div className="absolute top-8 left-8">SYS.LOC: {hex1}</div>
      <div className="absolute bottom-8 right-8">MEM.ALLOC: {hex2}</div>
      <div className="absolute top-8 right-8 text-red-500 animate-pulse">REC ●</div>
      
      {/* Spinning Reticle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center">
        <div className="w-24 h-24 border-t border-b border-cyan-400/50 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
      </div>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [sequenceState, setSequenceState] = useState<VideoSequenceState>('pre_playing');
  const [targetPath, setTargetPath] = useState<string | null>(null);

  // --- 3. 3D HOVER STATE ---
  const [cardTransform, setCardTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', tenantId: '' }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/login', {
        email: data.email,
        password: data.password,
        tenantId: data.tenantId || null
      });
      
      const { token, role, ...userData } = response.data;
      login({ ...userData, role }, token);
      
      AudioEngine.playAccessGranted(); // Play success sound
      toast({ title: 'Access Granted', description: 'Authentication successful. Initiating portal.' });
      
      if (role === 'SUPER_ADMIN') {
        setTargetPath('/admin');
      } else {
        setTargetPath('/dashboard');
      }
      
      setSequenceState('post_playing');
      
    } catch (error) {
      console.error('Login failed', error);
      setIsLoading(false); 
    }
  };

  const handlePostVideoEnd = () => {
    if (targetPath) {
      navigate(targetPath);
    }
  };

  const skipIntro = () => {
    if (sequenceState === 'pre_playing') {
       setSequenceState('form_visible');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (sequenceState !== 'form_visible') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (y / rect.height) * -15; // Max 15deg tilt
    const rotateY = (x / rect.width) * 15;
    setCardTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };

  const handleMouseLeave = () => {
    setCardTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  };

  // Typed text values
  const isFormVisible = sequenceState === 'form_visible';
  const titleText = useTypingEffect('System Access', isFormVisible);
  const descText = useTypingEffect('Initialize connection to modular grid', isFormVisible, 20);
  const emailLabelText = useTypingEffect('Identifier', isFormVisible);
  const passwordLabelText = useTypingEffect('Security Code', isFormVisible);

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. CRT Scanline & Vignette Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          background: `
            linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
            linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))
          `,
          backgroundSize: '100% 2px, 3px 100%',
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.9)'
        }}
      />

      <HudOverlay visible={sequenceState === 'pre_playing'} />

      {/* Pre-Login Video Background */}
      <video 
        autoPlay 
        muted 
        playsInline
        onEnded={() => setSequenceState('form_visible')}
        className="fixed inset-0 w-full h-full object-cover z-[-2]"
      >
        <source src="/PreLogin.mp4" type="video/mp4" />
      </video>

      <div 
        className={`fixed inset-0 bg-black/60 z-[-1] transition-opacity duration-1000 ${
          sequenceState === 'form_visible' ? 'opacity-100' : 'opacity-0'
        }`} 
      />

      {sequenceState === 'pre_playing' && (
        <button 
          onClick={skipIntro}
          className="fixed bottom-8 right-8 z-50 text-white/50 hover:text-white font-mono text-sm tracking-widest transition-colors cursor-pointer"
        >
          SKIP SEQUENCE &gt;&gt;
        </button>
      )}

      {/* Main Login UI */}
      <div 
        className={`absolute inset-0 flex items-center justify-center p-4 transition-all duration-1000 ${
          sequenceState === 'form_visible' 
            ? 'opacity-100' 
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div style={{ transform: cardTransform, transition: 'transform 0.1s ease-out' }} className="w-full max-w-md">
          <Card className="bg-background/60 backdrop-blur-xl border-primary/20 shadow-[0_0_50px_rgba(0,0,0,0.6)]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight text-center font-mono">
                {titleText}<span className="animate-pulse">_</span>
              </CardTitle>
              <CardDescription className="text-center font-mono opacity-70 min-h-[20px]">
                {descText}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-mono">{emailLabelText}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    {...register('email')} 
                    onKeyDown={AudioEngine.playBeep}
                    className="bg-background/40 border-primary/30 font-mono transition-all focus:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-mono">{passwordLabelText}</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      {...register('password')} 
                      onKeyDown={AudioEngine.playBeep}
                      className="pr-10 bg-background/40 border-primary/30 font-mono transition-all focus:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    />
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 opacity-70" />
                      ) : (
                        <Eye className="h-4 w-4 opacity-70" />
                      )}
                    </Button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full font-mono font-bold tracking-widest mt-6 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]" 
                  disabled={isLoading}
                >
                  {isLoading ? 'AUTHENTICATING...' : 'AUTHORIZE LOGIN'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-muted-foreground font-mono">
               FIRST TIME SETUP? &nbsp;<Link to="/setup" className="hover:text-primary underline">INITIALIZE PLATFORM</Link>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Post-Login Video Transition */}
      {sequenceState === 'post_playing' && (
        <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
          <video 
            autoPlay 
            muted 
            playsInline
            onEnded={handlePostVideoEnd}
            className="w-full h-full object-cover animate-in fade-in duration-500"
          >
            <source src="/PostLogin.mp4" type="video/mp4" />
          </video>
        </div>
      )}
    </div>
  );
}
