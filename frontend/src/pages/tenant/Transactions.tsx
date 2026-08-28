import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTransactions, useTransactionsRange, useStockIn, useStockOut, useStockTransfer } from '@/hooks/useInventory';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
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
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft, History, PackagePlus, PackageMinus, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

const transferSchema = z.object({
  fromProductId: z.string().min(1, "Source product is required"),
  toProductId: z.string().min(1, "Destination product is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().max(500).optional(),
}).refine(data => data.fromProductId !== data.toProductId, {
  message: "Source and destination must be different",
  path: ["toProductId"]
});

const transactionSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().max(500).optional(),
});

export default function Transactions() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { data: pageData, isLoading: isLoadingAll } = useTransactions(0, 50);
  const { data: rangeData, isLoading: isLoadingRange } = useTransactionsRange(startDate, endDate, 0, 50);
  
  const transactions = (startDate && endDate) ? (rangeData?.content || []) : (pageData?.content || []);
  const isLoading = (startDate && endDate) ? isLoadingRange : isLoadingAll;
  
  const { data: productsPage } = useProducts(0, 1000);
  const products = productsPage?.content || [];

  const stockIn = useStockIn();
  const stockOut = useStockOut();
  const stockTransfer = useStockTransfer();
  const { toast } = useToast();
  
  const [openIn, setOpenIn] = useState(false);
  const [openOut, setOpenOut] = useState(false);
  const [openTransfer, setOpenTransfer] = useState(false);

  

  const formIn = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { productId: '', quantity: 1, reason: 'PURCHASE', notes: '' },
  });

  const formOut = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { productId: '', quantity: 1, reason: 'SELL', notes: '' },
  });

  const formTransfer = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
    defaultValues: { fromProductId: '', toProductId: '', quantity: 1, reason: 'TRANSFER', notes: '' },
  });

  const onSubmitIn = (values: z.infer<typeof transactionSchema>) => {
    stockIn.mutate({ ...values, productId: parseInt(values.productId) }, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'Stock added successfully.' });
        setOpenIn(false);
        formIn.reset();
      },
      onError: (error: any) => {
        toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to add stock.' });
      },
    });
  };

  const onSubmitOut = (values: z.infer<typeof transactionSchema>) => {
    stockOut.mutate({ ...values, productId: parseInt(values.productId) }, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'Stock deducted successfully.' });
        setOpenOut(false);
        formOut.reset();
      },
      onError: (error: any) => {
        toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to deduct stock.' });
      },
    });
  };

  const onSubmitTransfer = (values: z.infer<typeof transferSchema>) => {
    stockTransfer.mutate({ 
      ...values, 
      fromProductId: parseInt(values.fromProductId),
      toProductId: parseInt(values.toProductId) 
    }, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'Stock transferred successfully.' });
        setOpenTransfer(false);
        formTransfer.reset();
      },
      onError: (error: any) => {
        toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to transfer stock.' });
      },
    });
  };

  const getTypeIcon = (type: string) => {
    if (type === 'IN') return <ArrowDownRight className="h-4 w-4 text-green-500" />;
    if (type === 'OUT') return <ArrowUpRight className="h-4 w-4 text-red-500" />;
    return <ArrowRightLeft className="h-4 w-4 text-cyan-500" />;
  };

  return (
    <div className="p-6 space-y-6 relative z-10 font-mono">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-cyan-900/50 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 border border-cyan-500/50 bg-cyan-950/20 text-cyan-400 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-widest text-cyan-400 uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              SYS.TRANSACTIONS
            </h1>
            <p className="text-cyan-600/70 mt-1 text-sm uppercase tracking-widest">
              INVENTORY MOVEMENT LOGS
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full xl:w-auto mt-4 xl:mt-0 flex-wrap">
          <div className="flex items-center gap-2 border border-cyan-900/50 px-2 bg-black/60 h-9 rounded-none">
            <span className="text-[10px] uppercase tracking-widest text-cyan-600/70 whitespace-nowrap">START:</span>
            <Input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[110px] h-8 border-0 focus-visible:ring-0 shadow-none px-1 p-0 text-xs bg-transparent text-cyan-400 [color-scheme:dark]" 
            />
            <span className="text-[10px] uppercase tracking-widest text-cyan-600/70 whitespace-nowrap">END:</span>
            <Input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[110px] h-8 border-0 focus-visible:ring-0 shadow-none px-1 p-0 text-xs bg-transparent text-cyan-400 [color-scheme:dark]" 
            />
            {(startDate || endDate) && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-none" 
                onClick={() => { setStartDate(''); setEndDate(''); }}
              >
                [X]
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Dialog open={openTransfer} onOpenChange={setOpenTransfer}>
              <DialogTrigger asChild>
                <Button className="rounded-none bg-cyan-950/30 text-cyan-400 border border-cyan-900/50 hover:bg-cyan-900/40 hover:text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)] transition-all whitespace-nowrap text-xs tracking-widest uppercase">
                  <Repeat className="mr-2 h-4 w-4" /> TRANSFER
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-black/95 border-cyan-900/50 rounded-none text-cyan-200 shadow-[0_0_30px_rgba(6,182,212,0.15)] font-mono">
                <DialogHeader>
                  <DialogTitle className="text-cyan-400 tracking-widest uppercase">INIT_TRANSFER</DialogTitle>
                  <DialogDescription className="text-cyan-600/70 text-xs uppercase tracking-widest">
                    MOVE ASSETS BETWEEN CATALOG ENTRIES.
                  </DialogDescription>
                </DialogHeader>
                <Form {...formTransfer}>
                  <form onSubmit={formTransfer.handleSubmit(onSubmitTransfer)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={formTransfer.control}
                        name="fromProductId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">SOURCE_ID *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus:ring-cyan-500/30"><SelectValue placeholder="SELECT_SRC" /></SelectTrigger></FormControl>
                              <SelectContent className="bg-black/95 border-cyan-900/50 rounded-none text-cyan-200 font-mono">
                                {products.map((p) => (
                                  <SelectItem key={p.id} value={p.id.toString()} className="focus:bg-cyan-950/50">{p.sku}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formTransfer.control}
                        name="toProductId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">DEST_ID *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus:ring-cyan-500/30"><SelectValue placeholder="SELECT_DEST" /></SelectTrigger></FormControl>
                              <SelectContent className="bg-black/95 border-cyan-900/50 rounded-none text-cyan-200 font-mono">
                                {products.map((p) => (
                                  <SelectItem key={p.id} value={p.id.toString()} className="focus:bg-cyan-950/50">{p.sku}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={formTransfer.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">QTY *</FormLabel>
                            <FormControl><Input type="number" min="1" {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus-visible:ring-cyan-500/30" /></FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formTransfer.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">REASON *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus:ring-cyan-500/30"><SelectValue placeholder="SELECT_REASON" /></SelectTrigger></FormControl>
                              <SelectContent className="bg-black/95 border-cyan-900/50 rounded-none text-cyan-200 font-mono">
                                <SelectItem value="TRANSFER" className="focus:bg-cyan-950/50">TRANSFER</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={formTransfer.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-cyan-500 text-xs tracking-widest uppercase">NOTES</FormLabel>
                          <FormControl><Input placeholder="REMARKS..." {...field} className="bg-cyan-950/20 border-cyan-900/50 rounded-none text-cyan-200 focus-visible:ring-cyan-500/30" /></FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end pt-4">
                      <Button type="submit" className="rounded-none bg-cyan-600 text-black hover:bg-cyan-500 font-bold tracking-widest uppercase text-xs" disabled={stockTransfer.isPending}>
                        {stockTransfer.isPending ? 'PROCESSING...' : 'EXECUTE'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={openOut} onOpenChange={setOpenOut}>
              <DialogTrigger asChild>
                <Button className="rounded-none bg-red-950/30 text-red-400 border border-red-900/50 hover:bg-red-900/40 hover:text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.1)] transition-all whitespace-nowrap text-xs tracking-widest uppercase">
                  <PackageMinus className="mr-2 h-4 w-4" /> STOCK_OUT
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-black/95 border-red-900/50 rounded-none text-red-200 shadow-[0_0_30px_rgba(239,68,68,0.15)] font-mono">
                <DialogHeader>
                  <DialogTitle className="text-red-400 tracking-widest uppercase">INIT_OUTBOUND</DialogTitle>
                  <DialogDescription className="text-red-600/70 text-xs uppercase tracking-widest">DEDUCT STOCK FROM INVENTORY.</DialogDescription>
                </DialogHeader>
                <Form {...formOut}>
                  <form onSubmit={formOut.handleSubmit(onSubmitOut)} className="space-y-4">
                    <FormField
                      control={formOut.control}
                      name="productId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-red-500 text-xs tracking-widest uppercase">PRODUCT_ID *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="bg-red-950/20 border-red-900/50 rounded-none text-red-200 focus:ring-red-500/30"><SelectValue placeholder="SELECT_ASSET" /></SelectTrigger></FormControl>
                            <SelectContent className="bg-black/95 border-red-900/50 rounded-none text-red-200 font-mono">
                              {products.map((p) => (
                                <SelectItem key={p.id} value={p.id.toString()} className="focus:bg-red-950/50">{p.sku}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={formOut.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-red-500 text-xs tracking-widest uppercase">QTY *</FormLabel>
                            <FormControl><Input type="number" min="1" {...field} className="bg-red-950/20 border-red-900/50 rounded-none text-red-200 focus-visible:ring-red-500/30" /></FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formOut.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-red-500 text-xs tracking-widest uppercase">REASON *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger className="bg-red-950/20 border-red-900/50 rounded-none text-red-200 focus:ring-red-500/30"><SelectValue placeholder="SELECT_REASON" /></SelectTrigger></FormControl>
                              <SelectContent className="bg-black/95 border-red-900/50 rounded-none text-red-200 font-mono">
                                <SelectItem value="SELL" className="focus:bg-red-950/50">SALE</SelectItem>
                                <SelectItem value="DAMAGE" className="focus:bg-red-950/50">DAMAGE</SelectItem>
                                <SelectItem value="TRANSFER" className="focus:bg-red-950/50">TRANSFER</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={formOut.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-red-500 text-xs tracking-widest uppercase">NOTES</FormLabel>
                          <FormControl><Input placeholder="REMARKS..." {...field} className="bg-red-950/20 border-red-900/50 rounded-none text-red-200 focus-visible:ring-red-500/30" /></FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end pt-4">
                      <Button type="submit" className="rounded-none bg-red-600 text-black hover:bg-red-500 font-bold tracking-widest uppercase text-xs" disabled={stockOut.isPending}>
                        {stockOut.isPending ? 'PROCESSING...' : 'EXECUTE'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={openIn} onOpenChange={setOpenIn}>
              <DialogTrigger asChild>
                <Button className="rounded-none bg-green-950/30 text-green-400 border border-green-900/50 hover:bg-green-900/40 hover:text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.1)] transition-all whitespace-nowrap text-xs tracking-widest uppercase">
                  <PackagePlus className="mr-2 h-4 w-4" /> STOCK_IN
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-black/95 border-green-900/50 rounded-none text-green-200 shadow-[0_0_30px_rgba(34,197,94,0.15)] font-mono">
                <DialogHeader>
                  <DialogTitle className="text-green-400 tracking-widest uppercase">INIT_INBOUND</DialogTitle>
                  <DialogDescription className="text-green-600/70 text-xs uppercase tracking-widest">ADD STOCK TO INVENTORY.</DialogDescription>
                </DialogHeader>
                <Form {...formIn}>
                  <form onSubmit={formIn.handleSubmit(onSubmitIn)} className="space-y-4">
                    <FormField
                      control={formIn.control}
                      name="productId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-500 text-xs tracking-widest uppercase">PRODUCT_ID *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="bg-green-950/20 border-green-900/50 rounded-none text-green-200 focus:ring-green-500/30"><SelectValue placeholder="SELECT_ASSET" /></SelectTrigger></FormControl>
                            <SelectContent className="bg-black/95 border-green-900/50 rounded-none text-green-200 font-mono">
                              {products.map((p) => (
                                <SelectItem key={p.id} value={p.id.toString()} className="focus:bg-green-950/50">{p.sku}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={formIn.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-green-500 text-xs tracking-widest uppercase">QTY *</FormLabel>
                            <FormControl><Input type="number" min="1" {...field} className="bg-green-950/20 border-green-900/50 rounded-none text-green-200 focus-visible:ring-green-500/30" /></FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formIn.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-green-500 text-xs tracking-widest uppercase">REASON *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger className="bg-green-950/20 border-green-900/50 rounded-none text-green-200 focus:ring-green-500/30"><SelectValue placeholder="SELECT_REASON" /></SelectTrigger></FormControl>
                              <SelectContent className="bg-black/95 border-green-900/50 rounded-none text-green-200 font-mono">
                                <SelectItem value="PURCHASE" className="focus:bg-green-950/50">PURCHASE</SelectItem>
                                <SelectItem value="RETURN" className="focus:bg-green-950/50">RETURN</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={formIn.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-500 text-xs tracking-widest uppercase">NOTES</FormLabel>
                          <FormControl><Input placeholder="REMARKS..." {...field} className="bg-green-950/20 border-green-900/50 rounded-none text-green-200 focus-visible:ring-green-500/30" /></FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end pt-4">
                      <Button type="submit" className="rounded-none bg-green-600 text-black hover:bg-green-500 font-bold tracking-widest uppercase text-xs" disabled={stockIn.isPending}>
                        {stockIn.isPending ? 'PROCESSING...' : 'EXECUTE'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
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
              <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">TIMESTAMP</TableHead>
              <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">TYPE</TableHead>
              <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">PRODUCT</TableHead>
              <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">REASON</TableHead>
              <TableHead className="text-right text-cyan-500 text-xs tracking-widest uppercase">DELTA</TableHead>
              <TableHead className="text-right text-cyan-500 text-xs tracking-widest uppercase">STATE_SHIFT</TableHead>
              <TableHead className="text-cyan-500 text-xs tracking-widest uppercase">OPERATOR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableCell colSpan={7} className="text-center p-8">
                  <div className="inline-block text-cyan-500 animate-pulse tracking-widest text-xs">FETCHING_LOGS...</div>
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow className="border-b border-cyan-900/30 hover:bg-transparent">
                <TableCell colSpan={7} className="text-center p-12 text-cyan-700">
                  <History className="h-12 w-12 mx-auto text-cyan-900 mb-3" />
                  NO_TRANSACTION_RECORDS_FOUND
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id} className="transition-colors border-b border-cyan-900/10 hover:bg-cyan-950/30">
                  <TableCell className="font-mono text-[10px] text-cyan-600/70 whitespace-nowrap">
                    {new Date(tx.transactionDate).toISOString().slice(0, 19).replace('T', ' ')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getTypeIcon(tx.transactionType)}
                      <span className={cn(
                        "ml-1.5 text-[10px] font-bold uppercase tracking-widest",
                        tx.transactionType === 'IN' ? 'text-green-400' : 
                        tx.transactionType === 'OUT' ? 'text-red-400' : 'text-cyan-400'
                      )}>
                        {tx.transactionType}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-cyan-300 text-sm">{tx.productName}</span>
                      <span className="text-[10px] text-cyan-600/70 tracking-widest">{tx.productSku}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-none border-cyan-900/50 bg-cyan-950/20 text-cyan-400 text-[10px] uppercase">
                      {tx.reason.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs">
                    <span className={tx.transactionType === 'IN' ? 'text-green-400' : tx.transactionType === 'OUT' ? 'text-red-400' : 'text-cyan-400'}>
                      {tx.transactionType === 'IN' ? '+' : tx.transactionType === 'OUT' ? '-' : ''}{tx.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-cyan-600/70 text-xs">
                    <span>{tx.stockBefore}</span>
                    <span className="mx-2 text-cyan-800">&rarr;</span>
                    <span className="font-bold text-cyan-300">{tx.stockAfter}</span>
                  </TableCell>
                  <TableCell className="text-[10px] text-cyan-600/70 uppercase">
                    {tx.performedBy}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
