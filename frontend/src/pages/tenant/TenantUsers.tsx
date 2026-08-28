import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTenantUsers, useUpdateTenantUser, useDeleteTenantUser, useCreateTenantUser } from '@/hooks/useTenantUsers';
import type { User } from '@/hooks/useTenantUsers';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit2, Users as UsersIcon, Plus } from 'lucide-react';

const createUserSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }).max(50),
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
  phone: z.string().max(14).optional().or(z.literal('')),
  role: z.enum(['TENANT_ADMIN', 'TENANT_USER']),
  isActive: z.boolean(),
});

const editUserSchema = z.object({
  username: z.string().min(2, { message: 'Username must be at least 2 characters.' }).max(32),
  email: z.string().email({ message: 'Invalid email' }),
  phone: z.string().max(10).optional().or(z.literal('')),
  role: z.enum(['TENANT_ADMIN', 'TENANT_USER']),
  isActive: z.boolean(),
});

export default function TenantUsers() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: pageData, isLoading } = useTenantUsers(page, 20, searchQuery);
  const users = pageData?.content || [];
  
  const updateTenantUser = useUpdateTenantUser();
  const deleteTenantUser = useDeleteTenantUser();
  const createTenantUser = useCreateTenantUser();
  const { toast } = useToast();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const createForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      phone: '',
      role: 'TENANT_USER',
      isActive: true,
    },
  });

  const editForm = useForm<z.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: '',
      email: '',
      phone: '',
      role: 'TENANT_USER',
      isActive: true,
    },
  });

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    editForm.reset({
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive,
    });
    setEditOpen(true);
  };

  const onCreateSubmit = (values: z.infer<typeof createUserSchema>) => {
    createTenantUser.mutate(values, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'User created successfully.' });
        setCreateOpen(false);
        createForm.reset();
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.message || 'Failed to create user.',
        });
      },
    });
  };

  const onEditSubmit = (values: z.infer<typeof editUserSchema>) => {
    if (!editingUser) return;
    updateTenantUser.mutate({ id: editingUser.id, data: values }, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'User updated successfully.' });
        setEditOpen(false);
        setEditingUser(null);
        editForm.reset();
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.message || 'Failed to update user.',
        });
      },
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteTenantUser.mutate(id, {
        onSuccess: () => {
          toast({ title: 'Success', description: 'User deleted.' });
        },
        onError: () => {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete user.' });
        }
      });
    }
  };

  return (
    <div className="p-6 space-y-6 relative z-10 font-mono">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyan-900/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-widest text-cyan-400">SYS.USERS</h1>
          <p className="text-cyan-600/70 mt-1 text-sm uppercase">MANAGE TENANT REGISTRY</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Input 
            placeholder="Search by username or email..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            className="w-full sm:w-64 bg-black/60 border-cyan-900/50 text-cyan-200 placeholder:text-cyan-800 focus-visible:ring-cyan-500 rounded-none tracking-wider"
          />
          <Button onClick={() => setCreateOpen(true)} className="bg-cyan-950 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900 hover:text-cyan-300 rounded-none tracking-widest whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            ADD.USER
          </Button>
        </div>
      </div>

      <div className="rounded-none border border-cyan-900/50 bg-black/80 shadow-[0_0_30px_rgba(6,182,212,0.05)] overflow-hidden flex flex-col relative group">
        <div className="p-4 border-b border-cyan-900/50 bg-cyan-950/20 flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-cyan-500" />
          <h3 className="font-bold text-sm text-cyan-500 tracking-widest uppercase">REGISTRY // LOCAL_USERS</h3>
        </div>
        <div className="flex-1 overflow-auto p-2">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableHead className="text-cyan-600 text-xs tracking-widest">USERNAME</TableHead>
                <TableHead className="text-cyan-600 text-xs tracking-widest">EMAIL</TableHead>
                <TableHead className="text-cyan-600 text-xs tracking-widest">ROLE</TableHead>
                <TableHead className="text-cyan-600 text-xs tracking-widest">STATUS</TableHead>
                <TableHead className="text-cyan-600 text-xs tracking-widest text-right">EXEC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center p-8 text-cyan-500 animate-pulse">
                    SCANNING NETWORK FOR USERS...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-8 text-cyan-700">
                    NO_USERS_FOUND.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="border-b border-cyan-900/10 hover:bg-cyan-950/30 transition-colors">
                    <TableCell className="font-medium text-cyan-100">{user.username}</TableCell>
                    <TableCell className="text-cyan-400/70 text-xs">{user.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 border text-[10px] font-bold uppercase tracking-widest ${
                        user.role === 'TENANT_ADMIN' 
                          ? 'border-amber-500 text-amber-400 bg-amber-950/50' 
                          : 'border-cyan-500 text-cyan-400 bg-cyan-950/50'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 border text-[10px] font-bold uppercase tracking-widest ${
                        user.isActive 
                          ? 'border-green-500 text-green-400 bg-green-950/50' 
                          : 'border-red-500 text-red-400 bg-red-950/50'
                      }`}>
                        {user.isActive ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)} className="h-8 w-8 text-cyan-500 hover:text-cyan-300 hover:bg-cyan-900/30 rounded-none border border-transparent hover:border-cyan-500/30">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} disabled={deleteTenantUser.isPending} className="h-8 w-8 text-red-500 hover:text-red-300 hover:bg-red-900/30 rounded-none border border-transparent hover:border-red-500/30">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {pageData && pageData.totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-cyan-900/30 bg-cyan-950/10">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="bg-transparent border-cyan-900/50 text-cyan-500 hover:bg-cyan-950 hover:text-cyan-400 rounded-none tracking-widest">
                PREV
              </Button>
              <span className="text-xs text-cyan-600 tracking-widest font-mono">
                PAGE {page + 1} OF {pageData.totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pageData.totalPages - 1, p + 1))} disabled={page >= pageData.totalPages - 1} className="bg-transparent border-cyan-900/50 text-cyan-500 hover:bg-cyan-950 hover:text-cyan-400 rounded-none tracking-widest">
                NEXT
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      <Dialog open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open);
        if (!open) createForm.reset();
      }}>
        <DialogContent className="sm:max-w-[425px] bg-black/95 border-cyan-900/50 text-cyan-200 font-mono rounded-none shadow-[0_0_50px_rgba(6,182,212,0.2)]">
          <DialogHeader className="border-b border-cyan-900/50 pb-4">
            <DialogTitle className="text-cyan-400 tracking-widest">SYS.ADD_USER</DialogTitle>
            <DialogDescription className="text-cyan-600/70 text-xs uppercase">
              CREATE A NEW USER IN YOUR TENANT.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 pt-4">
              <FormField
                control={createForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-500 text-xs tracking-widest">USERNAME *</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} className="bg-black/60 border-cyan-900/50 text-cyan-200 focus-visible:ring-cyan-500 rounded-none" />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-500 text-xs tracking-widest">EMAIL *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} className="bg-black/60 border-cyan-900/50 text-cyan-200 focus-visible:ring-cyan-500 rounded-none" />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-500 text-xs tracking-widest">PASSWORD *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="bg-black/60 border-cyan-900/50 text-cyan-200 focus-visible:ring-cyan-500 rounded-none" />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-500 text-xs tracking-widest">PHONE</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} className="bg-black/60 border-cyan-900/50 text-cyan-200 focus-visible:ring-cyan-500 rounded-none" />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-500 text-xs tracking-widest">ROLE *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-black/60 border-cyan-900/50 text-cyan-200 focus:ring-cyan-500 rounded-none">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black/95 border-cyan-900/50 text-cyan-200 rounded-none font-mono">
                        <SelectItem value="TENANT_USER" className="focus:bg-cyan-900/30 focus:text-cyan-300 cursor-pointer">TENANT_USER</SelectItem>
                        <SelectItem value="TENANT_ADMIN" className="focus:bg-cyan-900/30 focus:text-cyan-300 cursor-pointer">TENANT_ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between border-cyan-900/50 bg-cyan-950/10 border p-4 rounded-none">
                    <div className="space-y-0.5">
                      <FormLabel className="text-cyan-400 text-xs tracking-widest">ACCOUNT.ACTIVE</FormLabel>
                      <DialogDescription className="text-cyan-700 text-[10px]">
                        TOGGLE LOGIN PERMISSION
                      </DialogDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-950 border border-cyan-900/50"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end pt-4 border-t border-cyan-900/50 mt-4">
                <Button type="submit" disabled={createTenantUser.isPending} className="bg-cyan-950 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900 hover:text-cyan-300 rounded-none tracking-widest mt-4">
                  {createTenantUser.isPending ? 'PROCESSING...' : 'EXECUTE'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={editOpen} onOpenChange={(open) => {
        setEditOpen(open);
        if (!open) {
          setEditingUser(null);
          editForm.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[425px] bg-black/95 border-cyan-900/50 text-cyan-200 font-mono rounded-none shadow-[0_0_50px_rgba(6,182,212,0.2)]">
          <DialogHeader className="border-b border-cyan-900/50 pb-4">
            <DialogTitle className="text-cyan-400 tracking-widest">SYS.EDIT_USER</DialogTitle>
            <DialogDescription className="text-cyan-600/70 text-xs uppercase">
              UPDATE USER DETAILS AND PERMISSIONS.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 pt-4">
              <FormField
                control={editForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-500 text-xs tracking-widest">USERNAME *</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} className="bg-black/60 border-cyan-900/50 text-cyan-200 focus-visible:ring-cyan-500 rounded-none" />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-500 text-xs tracking-widest">EMAIL *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} className="bg-black/60 border-cyan-900/50 text-cyan-200 focus-visible:ring-cyan-500 rounded-none" />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-500 text-xs tracking-widest">PHONE</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} className="bg-black/60 border-cyan-900/50 text-cyan-200 focus-visible:ring-cyan-500 rounded-none" />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-500 text-xs tracking-widest">ROLE *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-black/60 border-cyan-900/50 text-cyan-200 focus:ring-cyan-500 rounded-none">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black/95 border-cyan-900/50 text-cyan-200 rounded-none font-mono">
                        <SelectItem value="TENANT_USER" className="focus:bg-cyan-900/30 focus:text-cyan-300 cursor-pointer">TENANT_USER</SelectItem>
                        <SelectItem value="TENANT_ADMIN" className="focus:bg-cyan-900/30 focus:text-cyan-300 cursor-pointer">TENANT_ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between border-cyan-900/50 bg-cyan-950/10 border p-4 rounded-none">
                    <div className="space-y-0.5">
                      <FormLabel className="text-cyan-400 text-xs tracking-widest">ACCOUNT.ACTIVE</FormLabel>
                      <DialogDescription className="text-cyan-700 text-[10px]">
                        TOGGLE LOGIN PERMISSION
                      </DialogDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-950 border border-cyan-900/50"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end pt-4 border-t border-cyan-900/50 mt-4">
                <Button type="submit" disabled={updateTenantUser.isPending} className="bg-cyan-950 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900 hover:text-cyan-300 rounded-none tracking-widest mt-4">
                  {updateTenantUser.isPending ? 'PROCESSING...' : 'COMMIT.CHANGES'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
