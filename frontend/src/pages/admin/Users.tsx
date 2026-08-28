import { useState } from 'react';
import { useUsers, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit2, Users as UsersIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const editUserSchema = z.object({
  username: z.string().min(2, { message: 'Username must be at least 2 characters.' }).max(32),
  email: z.string().email({ message: 'Invalid email' }),
  phone: z.string().max(14).optional().or(z.literal('')),
  role: z.enum(['SUPER_ADMIN', 'TENANT_ADMIN', 'TENANT_USER']),
  isActive: z.boolean(),
});

export default function Users() {
  const { data: users, isLoading, isError } = useUsers();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

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

  const onEditClick = (user: any) => {
    setEditingUser(user);
    editForm.reset({
      username: user.username,
      email: user.email,
      phone: user.phone || user.phoneNo || '',
      role: user.role as 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'TENANT_USER',
      isActive: user.isActive,
    });
    setEditOpen(true);
  };

  const onEditSubmit = (values: z.infer<typeof editUserSchema>) => {
    if (!editingUser) return;
    updateUser.mutate({ id: editingUser.id || editingUser.userId, data: values }, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'User updated successfully.' });
        setEditOpen(false);
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

  const onDeleteClick = (user: any) => {
    if (window.confirm(`Are you sure you want to delete user ${user.username}?`)) {
      deleteUser.mutate(user.id || user.userId, {
        onSuccess: () => toast({ title: 'Success', description: 'User deleted.' }),
        onError: () => toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete.' }),
      });
    }
  };

  const filteredUsers = users?.filter((user: any) => 
    (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) return <div className="p-8 text-center text-cyan-500 font-mono animate-pulse relative z-10">SCANNING NETWORK FOR USERS...</div>;
  if (isError) return <div className="p-8 text-center text-red-500 font-mono relative z-10">SYS.ERR: FAILED TO LOAD USER DATA.</div>;

  return (
    <div className="p-6 space-y-6 relative z-10 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-900/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-widest text-cyan-400">SYS.USERS</h1>
          <p className="text-cyan-600/70 mt-1 text-sm uppercase">GLOBAL PLATFORM USER REGISTRY</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-black/60 border-cyan-900/50 text-cyan-200 placeholder:text-cyan-800 focus-visible:ring-cyan-500 rounded-none tracking-wider"
          />
        </div>
      </div>

      <div className="rounded-none border border-cyan-900/50 bg-black/80 shadow-[0_0_30px_rgba(6,182,212,0.05)] overflow-hidden flex flex-col relative group">
        <div className="p-4 border-b border-cyan-900/50 bg-cyan-950/20 flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-cyan-500" />
          <h3 className="font-bold text-sm text-cyan-500 tracking-widest uppercase">REGISTRY // ALL_USERS</h3>
        </div>
        <div className="flex-1 overflow-auto p-2">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableHead className="text-cyan-600 text-xs tracking-widest">USER.ID</TableHead>
                <TableHead className="text-cyan-600 text-xs tracking-widest">USERNAME</TableHead>
                <TableHead className="text-cyan-600 text-xs tracking-widest">EMAIL</TableHead>
                <TableHead className="text-cyan-600 text-xs tracking-widest">ROLE</TableHead>
                <TableHead className="text-cyan-600 text-xs tracking-widest">TENANT.ID</TableHead>
                <TableHead className="text-cyan-600 text-xs tracking-widest">STATUS</TableHead>
                <TableHead className="text-cyan-600 text-xs tracking-widest">INIT.DATE</TableHead>
                <TableHead className="text-cyan-600 text-xs tracking-widest text-right">EXEC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.length === 0 ? (
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell colSpan={8} className="text-center py-8 text-cyan-700">
                    NO_USERS_FOUND.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((user: any) => (
                  <TableRow key={user.userId || user.id} className="border-b border-cyan-900/10 hover:bg-cyan-950/30 transition-colors">
                    <TableCell className="text-cyan-300 text-xs">{user.userId || user.id}</TableCell>
                    <TableCell className="font-medium text-cyan-100">{user.username}</TableCell>
                    <TableCell className="text-cyan-400/70 text-xs">{user.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 border text-[10px] font-bold uppercase tracking-widest ${
                        user.role === 'SUPER_ADMIN' 
                          ? 'border-amber-500 text-amber-400 bg-amber-950/50' 
                          : 'border-cyan-500 text-cyan-400 bg-cyan-950/50'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-cyan-600 text-xs">
                      {user.tenantId || 'N/A'}
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
                    <TableCell className="text-cyan-700 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toISOString().slice(0, 10) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEditClick(user)} className="h-8 w-8 text-cyan-500 hover:text-cyan-300 hover:bg-cyan-900/30 rounded-none border border-transparent hover:border-cyan-500/30">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDeleteClick(user)} className="h-8 w-8 text-red-500 hover:text-red-300 hover:bg-red-900/30 rounded-none border border-transparent hover:border-red-500/30">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={(open) => {
        setEditOpen(open);
        if (!open) setEditingUser(null);
      }}>
        <DialogContent className="sm:max-w-[425px] bg-black/95 border-cyan-900/50 text-cyan-200 font-mono rounded-none shadow-[0_0_50px_rgba(6,182,212,0.2)]">
          <DialogHeader className="border-b border-cyan-900/50 pb-4">
            <DialogTitle className="text-cyan-400 tracking-widest">EDIT.USER</DialogTitle>
            <DialogDescription className="text-cyan-600/70 text-xs uppercase">
              Update user details and permissions.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 pt-4">
              <FormField
                control={editForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-500 text-xs tracking-widest">USERNAME</FormLabel>
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
                    <FormLabel className="text-cyan-500 text-xs tracking-widest">EMAIL</FormLabel>
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
                    <FormLabel className="text-cyan-500 text-xs tracking-widest">ROLE</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-black/60 border-cyan-900/50 text-cyan-200 focus:ring-cyan-500 rounded-none">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black/95 border-cyan-900/50 text-cyan-200 rounded-none font-mono">
                        <SelectItem value="TENANT_USER" className="focus:bg-cyan-900/30 focus:text-cyan-300 cursor-pointer">TENANT_USER</SelectItem>
                        <SelectItem value="TENANT_ADMIN" className="focus:bg-cyan-900/30 focus:text-cyan-300 cursor-pointer">TENANT_ADMIN</SelectItem>
                        <SelectItem value="SUPER_ADMIN" className="focus:bg-cyan-900/30 focus:text-cyan-300 cursor-pointer">SUPER_ADMIN</SelectItem>
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
                <Button type="submit" disabled={updateUser.isPending} className="bg-cyan-950 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900 hover:text-cyan-300 rounded-none tracking-widest mt-4">
                  {updateUser.isPending ? 'PROCESSING...' : 'COMMIT.CHANGES'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
