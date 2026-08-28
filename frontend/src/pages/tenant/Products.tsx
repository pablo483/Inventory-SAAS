import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProducts, useCreateProduct, useDeleteProduct, useUpdateProduct } from '@/hooks/useProducts';
import type { Product } from '@/hooks/useProducts';
import { useProductTransactions } from '@/hooks/useInventory';
import { useCategories } from '@/hooks/useCategories';
import { useSuppliers, useCreateSupplier } from '@/hooks/useSuppliers';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Package, AlertTriangle, Edit2, History as HistoryIcon, ArrowDownRight, ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const productFormSchema = z.object({
  sku: z.string().min(2).max(50).regex(/^[A-Z0-9-_]+$/, "SKU must contain only uppercase letters, numbers, hyphens, and underscores"),
  name: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  categoryId: z.string().min(1, "Category is required"),
  supplierId: z.string().optional(),
  initialStock: z.coerce.number().min(0, "Stock cannot be negative"),
  minStockThreshold: z.coerce.number().min(1, "Minimum stock must be at least 1"),
  price: z.coerce.number().min(0.01, "Price must be at least 0.01"),
});

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { data: pageData, isLoading } = useProducts(0, 50);
  const products = pageData?.content || [];

  
  const { data: categories } = useCategories();
  const { data: suppliersPage } = useSuppliers(0, 100);
  const suppliers = suppliersPage?.content || [];

  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();
  const createSupplier = useCreateSupplier();
  
  const [isAddingNewSupplier, setIsAddingNewSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const { data: historyPage, isLoading: historyLoading } = useProductTransactions(historyProduct?.id || 0, 0, 50);
  const historyTransactions = historyPage?.content || [];

  const isTenantAdmin = user?.role === 'TENANT_ADMIN';
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "all" || p.category?.id.toString() === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      categoryId: '',
      supplierId: '',
      initialStock: 0,
      minStockThreshold: 10,
      price: 0.00,
    },
  });

  const editForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      categoryId: '',
      supplierId: '',
      initialStock: 0,
      minStockThreshold: 10,
      price: 0.00,
    },
  });

  const onSubmit = async (values: z.infer<typeof productFormSchema>) => {
    let finalSupplierId = values.supplierId ? parseInt(values.supplierId) : null;

    if (isAddingNewSupplier && newSupplierName.trim()) {
      try {
        const newSup = await createSupplier.mutateAsync({ name: newSupplierName });
        finalSupplierId = newSup.id;
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.message || 'Failed to create new supplier.',
        });
        return;
      }
    }

    const data = {
      ...values,
      categoryId: parseInt(values.categoryId),
      supplierId: finalSupplierId,
    };

    createProduct.mutate(data, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'Product added to inventory.' });
        setOpen(false);
        form.reset();
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.message || 'Failed to add product.',
        });
      },
    });
  };

  const onEditSubmit = async (values: z.infer<typeof productFormSchema>) => {
    if (!editingProduct) return;
    
    let finalSupplierId = values.supplierId ? parseInt(values.supplierId) : null;

    if (isAddingNewSupplier && newSupplierName.trim()) {
      try {
        const newSup = await createSupplier.mutateAsync({ name: newSupplierName });
        finalSupplierId = newSup.id;
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.message || 'Failed to create new supplier.',
        });
        return;
      }
    }

    const data = {
      ...values,
      categoryId: parseInt(values.categoryId),
      supplierId: finalSupplierId,
    };

    updateProduct.mutate({ id: editingProduct.id, data }, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'Product updated successfully.' });
        setEditOpen(false);
        setEditingProduct(null);
        editForm.reset();
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.message || 'Failed to update product.',
        });
      },
    });
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    editForm.reset({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      categoryId: product.category.id.toString(),
      supplierId: product.supplier?.id.toString() || '',
      initialStock: product.currentStock,
      minStockThreshold: product.minThresholdStock,
      price: product.price,
    });
    setEditOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct.mutate(id, {
        onSuccess: () => {
          toast({ title: 'Success', description: 'Product deleted.' });
        },
        onError: () => {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete product.' });
        }
      });
    }
  };

  return (
    <div className="p-6 space-y-6 relative z-10 font-mono">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyan-900/50 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 border border-cyan-500/50 bg-cyan-950/20 text-cyan-400 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-widest text-cyan-400 uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              SYS.PRODUCTS
            </h1>
            <p className="text-cyan-600/70 mt-1 text-sm uppercase tracking-widest">
              MASTER CATALOG DATA MATRIX
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
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
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px] bg-black/60 border-cyan-900/50 rounded-none text-cyan-200 focus:ring-cyan-500/30 uppercase text-xs tracking-widest">
              <SelectValue placeholder="ALL_CATEGORIES" />
            </SelectTrigger>
            <SelectContent className="bg-black/95 border-cyan-900/50 rounded-none text-cyan-200 uppercase text-xs font-mono">
              <SelectItem value="all" className="focus:bg-cyan-950/50 focus:text-cyan-100">ALL_CATEGORIES</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()} className="focus:bg-cyan-950/50 focus:text-cyan-100">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isTenantAdmin && (
            <Dialog open={open} onOpenChange={(val) => {
              setOpen(val);
              if (!val) {
                setIsAddingNewSupplier(false);
                setNewSupplierName("");
              }
            }}>
              <DialogTrigger asChild>
                <Button className="rounded-none bg-cyan-950/30 text-cyan-400 border border-cyan-900/50 hover:bg-cyan-900/40 hover:text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)] transition-all whitespace-nowrap text-xs tracking-widest uppercase">
                  <Plus className="mr-2 h-4 w-4" /> ADD_RECORD
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-black/95 border-cyan-900/50 rounded-none text-cyan-200 shadow-[0_0_30px_rgba(6,182,212,0.15)] font-mono">
              <DialogHeader>
                <DialogTitle className="text-cyan-400 tracking-widest uppercase">INIT_PRODUCT</DialogTitle>
                <DialogDescription className="text-cyan-600/70 text-xs uppercase tracking-widest">
                  DEFINE NEW CATALOG ENTRY PARAMETERS.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">SKU *</FormLabel>
                          <FormControl>
                            <Input placeholder="PROD-001" {...field} className="uppercase bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 placeholder:text-cyan-600/30 focus-visible:ring-cyan-500/30" />
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">PRODUCT_NAME *</FormLabel>
                          <FormControl>
                            <Input placeholder="ITEM_DESIGNATION" {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 placeholder:text-cyan-600/30 focus-visible:ring-cyan-500/30" />
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">DESCRIPTION</FormLabel>
                        <FormControl>
                          <Input placeholder="SPECIFICATIONS..." {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 placeholder:text-cyan-600/30 focus-visible:ring-cyan-500/30" />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">CATEGORY *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus:ring-cyan-500/30">
                                <SelectValue placeholder="SELECT_CLASS" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-black/95 border-cyan-900/50 rounded-none text-cyan-200 font-mono">
                              {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()} className="focus:bg-cyan-950/50">
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">SUPPLIER</FormLabel>
                            <button 
                              type="button" 
                              onClick={() => {
                                setIsAddingNewSupplier(!isAddingNewSupplier);
                                setNewSupplierName("");
                              }}
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 uppercase tracking-widest"
                            >
                              {isAddingNewSupplier ? '[SELECT_EXISTING]' : '[+ NEW]'}
                            </button>
                          </div>
                          <FormControl>
                            {isAddingNewSupplier ? (
                              <Input 
                                placeholder="NEW_SUPPLIER_NAME..." 
                                value={newSupplierName}
                                onChange={(e) => setNewSupplierName(e.target.value)}
                                className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus-visible:ring-cyan-500/30"
                              />
                            ) : (
                              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                <SelectTrigger className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus:ring-cyan-500/30">
                                  <SelectValue placeholder="SELECT_SUPPLIER" />
                                </SelectTrigger>
                                <SelectContent className="bg-black/95 border-cyan-900/50 rounded-none text-cyan-200 font-mono">
                                  <SelectItem value="" className="focus:bg-cyan-950/50">[NONE]</SelectItem>
                                  {suppliers?.map((sup) => (
                                    <SelectItem key={sup.id} value={sup.id.toString()} className="focus:bg-cyan-950/50">
                                      {sup.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">PRICE ($) *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus-visible:ring-cyan-500/30" />
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="initialStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">INIT_STOCK *</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus-visible:ring-cyan-500/30" />
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="minStockThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">ALERT_THOLD *</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus-visible:ring-cyan-500/30" />
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={createProduct.isPending} className="rounded-none bg-cyan-600 text-black hover:bg-cyan-500 font-bold tracking-widest uppercase text-xs">
                      {createProduct.isPending ? 'PROCESSING...' : 'EXECUTE'}
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
            setEditingProduct(null);
            editForm.reset();
            setIsAddingNewSupplier(false);
            setNewSupplierName("");
          }
        }}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-black/95 border-cyan-900/50 rounded-none text-cyan-200 shadow-[0_0_30px_rgba(6,182,212,0.15)] font-mono">
            <DialogHeader>
              <DialogTitle className="text-cyan-400 tracking-widest uppercase">MOD_PRODUCT // {editingProduct?.sku}</DialogTitle>
              <DialogDescription className="text-cyan-600/70 text-xs uppercase tracking-widest">
                UPDATE EXISTING CATALOG ENTRY PARAMETERS.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">SKU *</FormLabel>
                        <FormControl>
                          <Input placeholder="PROD-001" {...field} className="uppercase bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus-visible:ring-cyan-500/30" />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">PRODUCT_NAME *</FormLabel>
                        <FormControl>
                          <Input placeholder="ITEM_DESIGNATION" {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus-visible:ring-cyan-500/30" />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">DESCRIPTION</FormLabel>
                      <FormControl>
                        <Input placeholder="SPECIFICATIONS..." {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus-visible:ring-cyan-500/30" />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">CATEGORY *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus:ring-cyan-500/30">
                              <SelectValue placeholder="SELECT_CLASS" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-black/95 border-cyan-900/50 rounded-none text-cyan-200 font-mono">
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()} className="focus:bg-cyan-950/50">
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">SUPPLIER</FormLabel>
                          <button 
                            type="button" 
                            onClick={() => {
                              setIsAddingNewSupplier(!isAddingNewSupplier);
                              setNewSupplierName("");
                            }}
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 uppercase tracking-widest"
                          >
                            {isAddingNewSupplier ? '[SELECT_EXISTING]' : '[+ NEW]'}
                          </button>
                        </div>
                        <FormControl>
                          {isAddingNewSupplier ? (
                            <Input 
                              placeholder="NEW_SUPPLIER_NAME..." 
                              value={newSupplierName}
                              onChange={(e) => setNewSupplierName(e.target.value)}
                              className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus-visible:ring-cyan-500/30"
                            />
                          ) : (
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                              <SelectTrigger className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus:ring-cyan-500/30">
                                <SelectValue placeholder="SELECT_SUPPLIER" />
                              </SelectTrigger>
                              <SelectContent className="bg-black/95 border-cyan-900/50 rounded-none text-cyan-200 font-mono">
                                <SelectItem value="" className="focus:bg-cyan-950/50">[NONE]</SelectItem>
                                {suppliers?.map((sup) => (
                                  <SelectItem key={sup.id} value={sup.id.toString()} className="focus:bg-cyan-950/50">
                                    {sup.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={editForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">PRICE ($) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus-visible:ring-cyan-500/30" />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="initialStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">CUR_STOCK</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} disabled className="bg-cyan-950/5 border-cyan-900/30 rounded-none text-cyan-600/70" />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="minStockThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">ALERT_THOLD *</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus-visible:ring-cyan-500/30" />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={updateProduct.isPending} className="rounded-none bg-cyan-600 text-black hover:bg-cyan-500 font-bold tracking-widest uppercase text-xs">
                    {updateProduct.isPending ? 'UPDATING...' : 'APPLY_CHANGES'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!historyProduct} onOpenChange={(open) => !open && setHistoryProduct(null)}>
          <DialogContent className="sm:max-w-[800px] bg-black/95 border-cyan-900/50 rounded-none text-cyan-200 shadow-[0_0_30px_rgba(6,182,212,0.15)] font-mono">
            <DialogHeader>
              <DialogTitle className="text-cyan-400 tracking-widest uppercase">TX_LOGS // {historyProduct?.sku}</DialogTitle>
              <DialogDescription className="text-cyan-600/70 text-xs uppercase tracking-widest">
                HISTORICAL MOVEMENT DATA FOR: {historyProduct?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader className="bg-cyan-950/20">
                  <TableRow className="border-b border-cyan-900/50">
                    <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">TIMESTAMP</TableHead>
                    <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">TYPE</TableHead>
                    <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">REASON</TableHead>
                    <TableHead className="text-right text-cyan-500 text-xs tracking-widest uppercase">DELTA</TableHead>
                    <TableHead className="text-right text-cyan-500 text-xs tracking-widest uppercase">STATE_SHIFT</TableHead>
                    <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">OPERATOR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyLoading ? (
                    <TableRow className="border-b border-cyan-900/30"><TableCell colSpan={6} className="text-center text-cyan-500 animate-pulse text-xs tracking-widest py-4">LOADING_LOGS...</TableCell></TableRow>
                  ) : historyTransactions.length === 0 ? (
                    <TableRow className="border-b border-cyan-900/30"><TableCell colSpan={6} className="text-center text-cyan-700 text-xs tracking-widest py-4">NO_TRANSACTION_RECORDS_FOUND.</TableCell></TableRow>
                  ) : (
                    historyTransactions.map(tx => (
                      <TableRow key={tx.id} className="border-b border-cyan-900/10 hover:bg-cyan-950/30">
                        <TableCell className="text-cyan-600/70 text-[10px]">{new Date(tx.transactionDate).toISOString().slice(0, 19).replace('T', ' ')}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {tx.transactionType === 'IN' ? <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" /> :
                             tx.transactionType === 'OUT' ? <ArrowUpRight className="h-3 w-3 text-red-500 mr-1" /> :
                             <ArrowRightLeft className="h-3 w-3 text-cyan-500 mr-1" />}
                            <span className={cn("text-[10px] font-bold tracking-widest uppercase", 
                              tx.transactionType === 'IN' ? 'text-green-400' : 
                              tx.transactionType === 'OUT' ? 'text-red-400' : 'text-cyan-400'
                            )}>{tx.transactionType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="rounded-none border-cyan-900/50 bg-cyan-950/20 text-cyan-400 text-[10px] uppercase">{tx.reason}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-xs">
                          <span className={tx.transactionType === 'IN' ? 'text-green-400' : tx.transactionType === 'OUT' ? 'text-red-400' : 'text-cyan-400'}>
                            {tx.transactionType === 'IN' ? '+' : tx.transactionType === 'OUT' ? '-' : ''}{tx.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-cyan-600/70 text-xs">
                          {tx.stockBefore} &rarr; <span className="text-cyan-300">{tx.stockAfter}</span>
                        </TableCell>
                        <TableCell className="text-[10px] text-cyan-600/70">{tx.performedBy}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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
              <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">SKU</TableHead>
              <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">PRODUCT</TableHead>
              <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">CATEGORY</TableHead>
              <TableHead className="text-right text-cyan-500 text-xs tracking-widest uppercase">PRICE</TableHead>
              <TableHead className="text-center text-cyan-500 text-xs tracking-widest uppercase">STOCK_LEVEL</TableHead>
              {isTenantAdmin && <TableHead className="text-right text-cyan-500 text-xs tracking-widest uppercase">ACTION</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableCell colSpan={6} className="text-center p-8">
                  <div className="inline-block text-cyan-500 animate-pulse tracking-widest text-xs">FETCHING_CATALOG...</div>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableCell colSpan={6} className="text-center p-12 text-cyan-700">
                  <Package className="h-12 w-12 mx-auto text-cyan-900 mb-3" />
                  CATALOG_EMPTY
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableCell colSpan={6} className="text-center p-12 text-cyan-700">
                  <Package className="h-12 w-12 mx-auto text-cyan-900 mb-3" />
                  NO_MATCH_FOUND
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="transition-colors border-b border-cyan-900/10 hover:bg-cyan-950/30">
                  <TableCell className="font-mono font-bold text-xs text-cyan-600">
                    {product.sku}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-cyan-300 text-sm">{product.name}</span>
                      {product.supplier && (
                        <span className="text-[10px] uppercase tracking-widest text-cyan-600/70">SRC: {product.supplier.name}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-none border-cyan-900/50 bg-cyan-950/20 text-cyan-500 text-[10px] tracking-widest uppercase">
                      {product.category?.name || 'UNCLASSIFIED'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-cyan-400">
                    ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={cn(
                        "font-bold font-mono",
                        product.isLowStock ? "text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" : "text-green-400"
                      )}>
                        {product.currentStock}
                      </span>
                      {product.isLowStock && (
                        <span className="flex items-center text-[10px] uppercase tracking-widest font-bold text-red-400 bg-red-950/50 border border-red-500/30 px-1.5 py-0.5 rounded-none">
                          <AlertTriangle className="h-3 w-3 mr-1 animate-pulse" /> LOW_STOCK
                        </span>
                      )}
                    </div>
                  </TableCell>
                  {isTenantAdmin && (
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-cyan-500 hover:text-cyan-300 hover:bg-cyan-950/50 rounded-none h-8 w-8 mr-1"
                        onClick={() => setHistoryProduct(product)}
                      >
                        <HistoryIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-amber-500 hover:text-amber-400 hover:bg-amber-950/30 rounded-none h-8 w-8 mr-1"
                        onClick={() => handleEditClick(product)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-400 hover:bg-red-950/30 rounded-none h-8 w-8"
                        onClick={() => handleDelete(product.id)}
                        disabled={deleteProduct.isPending}
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
