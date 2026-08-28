import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSuppliers, useCreateSupplier, useDeleteSupplier, useUpdateSupplier } from '@/hooks/useSuppliers';
import type { Supplier } from '@/hooks/useSuppliers';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Trash2, Truck, Phone, Mail, MapPin, Edit2 } from 'lucide-react';

const supplierFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(100),
  phone: z.string().max(20).optional(),
  contactEmail: z.string().email({ message: 'Invalid email' }).max(100).optional().or(z.literal('')),
  address: z.string().max(500).optional(),
});

export default function Suppliers() {
  const { data: pageData, isLoading } = useSuppliers(0, 50);
  const suppliers = pageData?.content || [];
  const { data: productsPage } = useProducts(0, 1000);
  const products = productsPage?.content || [];
  
  const createSupplier = useCreateSupplier();
  const deleteSupplier = useDeleteSupplier();
  const updateSupplier = useUpdateSupplier();
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isTenantAdmin = user?.role === 'TENANT_ADMIN';

  const filteredSuppliers = suppliers.filter(supplier => {
    const query = searchQuery.toLowerCase();
    if (supplier.name.toLowerCase().includes(query)) return true;
    
    const supplierProducts = products.filter(p => p.supplier?.id === supplier.id);
    for (const p of supplierProducts) {
      if (p.name.toLowerCase().includes(query)) return true;
      if (p.category?.name?.toLowerCase().includes(query)) return true;
    }
    return false;
  });

  const form = useForm<z.infer<typeof supplierFormSchema>>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      contactEmail: '',
      address: '',
    },
  });

  const editForm = useForm<z.infer<typeof supplierFormSchema>>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      contactEmail: '',
      address: '',
    },
  });

  const onSubmit = (values: z.infer<typeof supplierFormSchema>) => {
    // Clean up empty strings for optional fields
    const data = {
      name: values.name,
      phone: values.phone || undefined,
      contactEmail: values.contactEmail || undefined,
      address: values.address || undefined,
    };

    createSupplier.mutate(data, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'Supplier added successfully.' });
        setOpen(false);
        form.reset();
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.message || 'Failed to add supplier.',
        });
      },
    });
  };

  const onEditSubmit = (values: z.infer<typeof supplierFormSchema>) => {
    if (!editingSupplier) return;
    const data = {
      name: values.name,
      phone: values.phone || undefined,
      contactEmail: values.contactEmail || undefined,
      address: values.address || undefined,
    };
    updateSupplier.mutate({ id: editingSupplier.id, data }, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'Supplier updated successfully.' });
        setEditOpen(false);
        setEditingSupplier(null);
        editForm.reset();
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.message || 'Failed to update supplier.',
        });
      },
    });
  };

  const handleEditClick = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    editForm.reset({
      name: supplier.name,
      phone: supplier.phone || '',
      contactEmail: supplier.contactEmail || '',
      address: supplier.address || '',
    });
    setEditOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      deleteSupplier.mutate(id, {
        onSuccess: () => {
          toast({ title: 'Success', description: 'Supplier deleted.' });
        },
        onError: () => {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete supplier.' });
        }
      });
    }
  };

  return (
    <div className="p-6 space-y-6 relative z-10 font-mono">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyan-900/50 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 border border-cyan-500/50 bg-cyan-950/20 text-cyan-400 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-widest text-cyan-400 uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              SYS.SUPPLIERS
            </h1>
            <p className="text-cyan-600/70 mt-1 text-sm uppercase tracking-widest">
              VENDOR & LOGISTICS NETWORK
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-cyan-600/50 text-xs">/&gt;</span>
            </div>
            <Input 
              placeholder="SEARCH_DB..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border-cyan-900/50 rounded-none text-cyan-200 placeholder:text-cyan-600/50 focus-visible:ring-cyan-500/30 pl-8 uppercase text-xs tracking-widest"
            />
          </div>
          {isTenantAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-none bg-cyan-950/30 text-cyan-400 border border-cyan-900/50 hover:bg-cyan-900/40 hover:text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)] transition-all whitespace-nowrap text-xs tracking-widest uppercase">
                  <Plus className="mr-2 h-4 w-4" /> ADD_RECORD
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-black/95 border-cyan-900/50 rounded-none text-cyan-200 shadow-[0_0_30px_rgba(6,182,212,0.15)] font-mono">
              <DialogHeader>
                <DialogTitle className="text-cyan-400 tracking-widest uppercase">INIT_SUPPLIER</DialogTitle>
                <DialogDescription className="text-cyan-600/70 text-xs uppercase tracking-widest">
                  REGISTER NEW VENDOR NODE IN THE NETWORK.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">SUPPLIER_NAME *</FormLabel>
                        <FormControl>
                          <Input placeholder="ACME_CORP" {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 placeholder:text-cyan-600/30 focus-visible:ring-cyan-500/30 uppercase" />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">COMM_LINK (EMAIL)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="COMMS@ACME.COM" {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 placeholder:text-cyan-600/30 focus-visible:ring-cyan-500/30 uppercase" />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">VOICE_LINK (PHONE)</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 555 123 4567" {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 placeholder:text-cyan-600/30 focus-visible:ring-cyan-500/30" />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">PHYSICAL_LOC (ADDRESS)</FormLabel>
                        <FormControl>
                          <Input placeholder="COORDINATES..." {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 placeholder:text-cyan-600/30 focus-visible:ring-cyan-500/30 uppercase" />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={createSupplier.isPending} className="rounded-none bg-cyan-600 text-black hover:bg-cyan-500 font-bold tracking-widest uppercase text-xs">
                      {createSupplier.isPending ? 'PROCESSING...' : 'EXECUTE'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          )}
        </div>

        <Dialog open={editOpen} onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setEditingSupplier(null);
            editForm.reset();
          }
        }}>
          <DialogContent className="sm:max-w-[425px] bg-black/95 border-cyan-900/50 rounded-none text-cyan-200 shadow-[0_0_30px_rgba(6,182,212,0.15)] font-mono">
            <DialogHeader>
              <DialogTitle className="text-cyan-400 tracking-widest uppercase">MOD_SUPPLIER // {editingSupplier?.id}</DialogTitle>
              <DialogDescription className="text-cyan-600/70 text-xs uppercase tracking-widest">
                UPDATE VENDOR NODE PARAMETERS.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">SUPPLIER_NAME *</FormLabel>
                      <FormControl>
                        <Input placeholder="ACME_CORP" {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus-visible:ring-cyan-500/30 uppercase" />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">COMM_LINK (EMAIL)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="COMMS@ACME.COM" {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus-visible:ring-cyan-500/30 uppercase" />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">VOICE_LINK (PHONE)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 555 123 4567" {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus-visible:ring-cyan-500/30" />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">PHYSICAL_LOC (ADDRESS)</FormLabel>
                      <FormControl>
                        <Input placeholder="COORDINATES..." {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus-visible:ring-cyan-500/30 uppercase" />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={updateSupplier.isPending} className="rounded-none bg-cyan-600 text-black hover:bg-cyan-500 font-bold tracking-widest uppercase text-xs">
                    {updateSupplier.isPending ? 'UPDATING...' : 'APPLY_CHANGES'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-none border border-cyan-900/50 bg-black/80 shadow-[0_0_15px_rgba(6,182,212,0.05)] overflow-hidden relative group">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/50"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/50"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/50"></div>

        <Table>
          <TableHeader className="bg-cyan-950/20">
            <TableRow className="border-b border-cyan-900/50 hover:bg-transparent">
              <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">VENDOR_ID</TableHead>
              <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">COMMS_LINK</TableHead>
              <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">PHYSICAL_LOC</TableHead>
              {isTenantAdmin && <TableHead className="text-right text-cyan-500 text-xs tracking-widest uppercase">ACTION</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableCell colSpan={4} className="text-center p-8">
                  <div className="inline-block text-cyan-500 animate-pulse tracking-widest text-xs">SCANNING_NETWORK...</div>
                </TableCell>
              </TableRow>
            ) : suppliers.length === 0 ? (
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableCell colSpan={4} className="text-center p-12 text-cyan-700">
                  <Truck className="h-12 w-12 mx-auto text-cyan-900 mb-3" />
                  NETWORK_EMPTY
                </TableCell>
              </TableRow>
            ) : filteredSuppliers.length === 0 ? (
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableCell colSpan={4} className="text-center p-12 text-cyan-700">
                  <Truck className="h-12 w-12 mx-auto text-cyan-900 mb-3" />
                  NO_MATCH_FOUND
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} className="transition-colors border-b border-cyan-900/10 hover:bg-cyan-950/30">
                  <TableCell className="font-bold text-cyan-300 text-sm uppercase">{supplier.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      {supplier.contactEmail && (
                        <div className="flex items-center text-xs text-cyan-600/70 uppercase">
                          <Mail className="mr-2 h-3 w-3 text-cyan-500" /> {supplier.contactEmail}
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center text-xs text-cyan-600/70 uppercase">
                          <Phone className="mr-2 h-3 w-3 text-cyan-500" /> {supplier.phone}
                        </div>
                      )}
                      {!supplier.contactEmail && !supplier.phone && (
                        <span className="text-[10px] text-cyan-800 uppercase tracking-widest">OFFLINE</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-xs text-cyan-600/70 uppercase">
                      {supplier.address ? (
                        <>
                          <MapPin className="mr-2 h-3 w-3 text-cyan-500" /> {supplier.address}
                        </>
                      ) : (
                        <span className="text-[10px] text-cyan-800 uppercase tracking-widest">UNREGISTERED</span>
                      )}
                    </div>
                  </TableCell>
                  {isTenantAdmin && (
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-amber-500 hover:text-amber-400 hover:bg-amber-950/30 rounded-none h-8 w-8 mr-2"
                        onClick={() => handleEditClick(supplier)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-400 hover:bg-red-950/30 rounded-none h-8 w-8"
                        onClick={() => handleDelete(supplier.id)}
                        disabled={deleteSupplier.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
