"use client";

import * as React from "react";
import { Plus, Search, Eye, CreditCard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatCurrency, getStatusColor } from "@/lib/utils";
import { InvoiceFormModal } from "./invoice-form-modal";
import { PaymentFormModal } from "./payment-form-modal";
import toast from "react-hot-toast";

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: string;
  dueDate: string | null;
  customer: { name: string; phone: string };
  createdAt: string;
}

export function InvoicingContent() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = React.useState(false);
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [detailModal, setDetailModal] = React.useState(false);
  const [invoiceDetail, setInvoiceDetail] = React.useState<any>(null);

  React.useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter]);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/invoices?${params}`);
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewDetail(id: string) {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      const data = await res.json();
      setInvoiceDetail(data);
      setDetailModal(true);
    } catch {
      toast.error("Failed to load invoice details");
    }
  }

  function handleRecordPayment(invoice: Invoice) {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoicing</h1>
          <p className="text-gray-500">Manage invoices and track payments</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {invoices.filter((i) => i.status === "PENDING" || i.status === "PARTIAL").length}
          </p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Paid</p>
          <p className="text-2xl font-bold text-green-600">
            {invoices.filter((i) => i.status === "PAID").length}
          </p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Total Due</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(invoices.reduce((sum, i) => sum + Number(i.dueAmount), 0))}
          </p>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Invoices</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center p-8 text-gray-500">No invoices found. Create your first invoice to get started.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="font-medium font-mono">{invoice.invoiceNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.customer.name}</p>
                        <p className="text-sm text-gray-500">{invoice.customer.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(Number(invoice.totalAmount))}</TableCell>
                    <TableCell className="text-green-600">{formatCurrency(Number(invoice.paidAmount))}</TableCell>
                    <TableCell className="text-red-600">{formatCurrency(Number(invoice.dueAmount))}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>{invoice.status}</span>
                    </TableCell>
                    <TableCell>{invoice.dueDate ? formatDate(invoice.dueDate) : "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetail(invoice.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.status !== "PAID" && (
                          <Button variant="ghost" size="icon" onClick={() => handleRecordPayment(invoice)}>
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InvoiceFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={fetchInvoices} />

      {selectedInvoice && (
        <PaymentFormModal
          open={paymentModalOpen}
          onClose={() => { setPaymentModalOpen(false); setSelectedInvoice(null); }}
          onSuccess={fetchInvoices}
          invoiceId={selectedInvoice.id}
          dueAmount={Number(selectedInvoice.dueAmount)}
        />
      )}

      {detailModal && invoiceDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Invoice {invoiceDetail.invoiceNumber}</h2>
              <Button variant="ghost" size="icon" onClick={() => setDetailModal(false)}>
                <span className="sr-only">Close</span> X
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{invoiceDetail.customer?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoiceDetail.status)}`}>{invoiceDetail.status}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium">{formatCurrency(Number(invoiceDetail.totalAmount))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Amount</p>
                  <p className="font-medium text-red-600">{formatCurrency(Number(invoiceDetail.dueAmount))}</p>
                </div>
              </div>
              {invoiceDetail.payments?.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Payment History</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment #</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceDetail.payments.map((p: any) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-sm">{p.paymentNumber}</TableCell>
                          <TableCell>{formatCurrency(Number(p.amount))}</TableCell>
                          <TableCell>{p.method}</TableCell>
                          <TableCell>{formatDate(p.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
