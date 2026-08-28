import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '@/hooks/useCategories';
import type { Category } from '@/hooks/useCategories';
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
import { Plus, Trash2, Tags, Layers, Edit2 } from 'lucide-react';

const categoryFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters.' }),
});

export default function Categories() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const updateCategory = useUpdateCategory();
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isTenantAdmin = user?.role === 'TENANT_ADMIN';

  const filteredCategories = (categories || []).filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cat.id.toString().includes(searchQuery)
  );

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const editForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = (values: z.infer<typeof categoryFormSchema>) => {
    createCategory.mutate(values, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'Category created successfully.' });
        setOpen(false);
        form.reset();
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.message || 'Failed to create category.',
        });
      },
    });
  };

  const onEditSubmit = (values: z.infer<typeof categoryFormSchema>) => {
    if (!editingCategory) return;
    updateCategory.mutate({ id: editingCategory.id, data: values }, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'Category updated successfully.' });
        setEditOpen(false);
        setEditingCategory(null);
        editForm.reset();
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.message || 'Failed to update category.',
        });
      },
    });
  };

  const handleEditClick = (cat: Category) => {
    setEditingCategory(cat);
    editForm.reset({
      name: cat.name,
      description: cat.description,
    });
    setEditOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory.mutate(id, {
        onSuccess: () => {
          toast({ title: 'Success', description: 'Category deleted.' });
        },
        onError: () => {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete category.' });
        }
      });
    }
  };

  return (
    <div className="p-6 space-y-6 relative z-10 font-mono">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyan-900/50 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 border border-cyan-500/50 bg-cyan-950/20 text-cyan-400 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-widest text-cyan-400 uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              SYS.CATEGORIES
            </h1>
            <p className="text-cyan-600/70 mt-1 text-sm uppercase tracking-widest">
              PRODUCT CLASSIFICATION MATRIX
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
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
            <DialogContent className="bg-black/95 border-cyan-900/50 rounded-none text-cyan-200 shadow-[0_0_30px_rgba(6,182,212,0.15)] font-mono">
              <DialogHeader>
                <DialogTitle className="text-cyan-400 tracking-widest uppercase">INIT_CATEGORY</DialogTitle>
                <DialogDescription className="text-cyan-600/70 text-xs uppercase tracking-widest">
                  DEFINE NEW PRODUCT CLASSIFICATION PARAMETERS.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">CATEGORY_NAME</FormLabel>
                        <FormControl>
                          <Input placeholder="E.G. HARDWARE" {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 placeholder:text-cyan-600/30 focus-visible:ring-cyan-500/30" />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">DESCRIPTION</FormLabel>
                        <FormControl>
                          <Input placeholder="CLASSIFICATION DETAILS..." {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 placeholder:text-cyan-600/30 focus-visible:ring-cyan-500/30" />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={createCategory.isPending} className="rounded-none bg-cyan-600 text-black hover:bg-cyan-500 font-bold tracking-widest uppercase text-xs">
                      {createCategory.isPending ? 'PROCESSING...' : 'EXECUTE'}
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
            setEditingCategory(null);
            editForm.reset();
          }
        }}>
          <DialogContent className="bg-black/95 border-cyan-900/50 rounded-none text-cyan-200 shadow-[0_0_30px_rgba(6,182,212,0.15)] font-mono">
            <DialogHeader>
              <DialogTitle className="text-cyan-400 tracking-widest uppercase">MOD_CATEGORY // {editingCategory?.id}</DialogTitle>
              <DialogDescription className="text-cyan-600/70 text-xs uppercase tracking-widest">
                UPDATE EXISTING CLASSIFICATION PARAMETERS.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">CATEGORY_NAME</FormLabel>
                      <FormControl>
                        <Input placeholder="E.G. HARDWARE" {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 placeholder:text-cyan-600/30 focus-visible:ring-cyan-500/30" />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">DESCRIPTION</FormLabel>
                      <FormControl>
                        <Input placeholder="CLASSIFICATION DETAILS..." {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 placeholder:text-cyan-600/30 focus-visible:ring-cyan-500/30" />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={updateCategory.isPending} className="rounded-none bg-cyan-600 text-black hover:bg-cyan-500 font-bold tracking-widest uppercase text-xs">
                    {updateCategory.isPending ? 'UPDATING...' : 'APPLY_CHANGES'}
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
              <TableHead className="w-[80px] text-cyan-500 text-xs tracking-widest uppercase">SYS.ID</TableHead>
              <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">CLASS_NAME</TableHead>
              <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">PARAMETERS</TableHead>
              <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">INIT_DATE</TableHead>
              {isTenantAdmin && <TableHead className="text-right text-cyan-500 text-xs tracking-widest uppercase">ACTION</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableCell colSpan={5} className="text-center p-8">
                  <div className="inline-block text-cyan-500 animate-pulse tracking-widest text-xs">FETCHING_RECORDS...</div>
                </TableCell>
              </TableRow>
            ) : !categories || categories.length === 0 ? (
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableCell colSpan={5} className="text-center p-8 text-cyan-700">
                  <Tags className="h-12 w-12 mx-auto text-cyan-900 mb-3" />
                  DB_EMPTY
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableCell colSpan={5} className="text-center p-8 text-cyan-700">
                  <Tags className="h-12 w-12 mx-auto text-cyan-900 mb-3" />
                  NO_MATCH_FOUND
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((cat) => (
                <TableRow key={cat.id} className="transition-colors border-b border-cyan-900/10 hover:bg-cyan-950/30">
                  <TableCell className="font-mono text-cyan-600 text-xs">#{cat.id}</TableCell>
                  <TableCell className="font-bold text-cyan-300 text-sm">{cat.name}</TableCell>
                  <TableCell className="text-cyan-600/70 text-xs">{cat.description}</TableCell>
                  <TableCell className="text-cyan-600/70 text-xs">{new Date(cat.createdAt).toLocaleDateString()}</TableCell>
                  {isTenantAdmin && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-amber-500 hover:text-amber-400 hover:bg-amber-950/30 rounded-none h-8 w-8 mr-2"
                        onClick={() => handleEditClick(cat)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-400 hover:bg-red-950/30 rounded-none h-8 w-8"
                        onClick={() => handleDelete(cat.id)}
                        disabled={deleteCategory.isPending}
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
