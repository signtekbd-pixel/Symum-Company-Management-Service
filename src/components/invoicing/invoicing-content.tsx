"use client";

import * as React from "react";
import { Plus, Search, Eye, CreditCard, FileText, Download, Share2, CheckCircle } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatCurrency, getStatusColor } from "@/lib/utils";
import { InvoiceFormModal } from "./invoice-form-modal";
import { PaymentFormModal } from "./payment-form-modal";
import toast from "react-hot-toast";
import { toPng, toJpeg } from "html-to-image";
import jsPDF from "jspdf";

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

const BIZ = {
  name: "PrintERP Ltd",
  address: "123 Print Street, Dhaka",
  phone: "+8801712345678",
  email: "info@prinerp.com",
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
  const [exporting, setExporting] = React.useState(false);
  const [markPaidModal, setMarkPaidModal] = React.useState(false);
  const [markPaidPassword, setMarkPaidPassword] = React.useState("");
  const [markPaidHolding, setMarkPaidHolding] = React.useState(false);
  const [markPaidProgress, setMarkPaidProgress] = React.useState(0);
  const [markPaidLoading, setMarkPaidLoading] = React.useState(false);
  const holdTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const exportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter]);

  React.useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

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

  function inv(): any {
    return invoiceDetail;
  }

  function exportFilename(ext: string) {
    return `${inv().invoiceNumber || "invoice"}.${ext}`;
  }

  async function getExportNode(): Promise<HTMLDivElement> {
    if (!exportRef.current) throw new Error("Export node not ready");
    return exportRef.current;
  }

  async function exportPng() {
    setExporting(true);
    try {
      const node = await getExportNode();
      const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      downloadBlob(blob, exportFilename("png"));
      toast.success("Downloaded PNG");
    } catch {
      toast.error("Failed to generate PNG");
    } finally {
      setExporting(false);
    }
  }

  async function exportJpg() {
    setExporting(true);
    try {
      const node = await getExportNode();
      const dataUrl = await toJpeg(node, { pixelRatio: 2, backgroundColor: "#ffffff", quality: 0.95 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      downloadBlob(blob, exportFilename("jpg"));
      toast.success("Downloaded JPG");
    } catch {
      toast.error("Failed to generate JPG");
    } finally {
      setExporting(false);
    }
  }

  async function exportPdf() {
    setExporting(true);
    try {
      const node = await getExportNode();
      const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });
      const pdfHeight = (img.height * pdfWidth) / img.width;
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(exportFilename("pdf"));
      toast.success("Downloaded PDF");
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setExporting(false);
    }
  }

  function exportTxt() {
    const d = inv();
    if (!d) return;
    const lines: string[] = [];
    lines.push("========================================");
    lines.push(`  ${BIZ.name}`);
    lines.push(`  ${BIZ.address}`);
    lines.push(`  ${BIZ.phone} | ${BIZ.email}`);
    lines.push("========================================");
    lines.push("");
    lines.push(`INVOICE: ${d.invoiceNumber}`);
    lines.push(`Date: ${formatDate(d.createdAt)}`);
    if (d.dueDate) lines.push(`Due Date: ${formatDate(d.dueDate)}`);
    lines.push(`Status: ${d.status}`);
    lines.push("");
    lines.push(`Customer: ${d.customer?.name || "-"}`);
    lines.push(`Phone: ${d.customer?.phone || "-"}`);
    if (d.customer?.email) lines.push(`Email: ${d.customer.email}`);
    if (d.customer?.company) lines.push(`Company: ${d.customer.company}`);
    lines.push("");
    lines.push("----------------------------------------");
    lines.push(`Subtotal:      ${formatCurrency(Number(d.subtotal || 0))}`);
    lines.push(`Tax:           ${formatCurrency(Number(d.tax || 0))}`);
    lines.push(`Discount:      -${formatCurrency(Number(d.discount || 0))}`);
    lines.push("----------------------------------------");
    lines.push(`TOTAL:         ${formatCurrency(Number(d.totalAmount))}`);
    lines.push(`PAID:          ${formatCurrency(Number(d.paidAmount || 0))}`);
    lines.push(`DUE:           ${formatCurrency(Number(d.dueAmount))}`);
    lines.push("----------------------------------------");
    if (d.notes) {
      lines.push("");
      lines.push(`Notes: ${d.notes}`);
    }
    if (d.payments?.length > 0) {
      lines.push("");
      lines.push("PAYMENT HISTORY:");
      d.payments.forEach((p: any, i: number) => {
        lines.push(
          `  ${i + 1}. ${p.paymentNumber} | ${p.method} | ${formatCurrency(Number(p.amount))} | ${formatDate(p.createdAt)}`
        );
      });
    }
    lines.push("");
    lines.push("========================================");
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, exportFilename("txt"));
    toast.success("Downloaded TXT");
  }

  async function shareInvoice() {
    setExporting(true);
    try {
      const node = await getExportNode();
      const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], exportFilename("png"), { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `Invoice ${inv().invoiceNumber}`,
          text: `Invoice ${inv().invoiceNumber} - ${formatCurrency(Number(inv().totalAmount))}`,
          files: [file],
        });
        toast.success("Shared successfully");
      } else {
        await navigator.clipboard.writeText(
          `Invoice ${inv().invoiceNumber} - ${formatCurrency(Number(inv().totalAmount))} (${inv().status})`
        );
        toast.success("Invoice details copied to clipboard");
      }
    } catch {
      toast.error("Failed to share");
    } finally {
      setExporting(false);
    }
  }

  function openMarkPaidModal() {
    setMarkPaidPassword("");
    setMarkPaidProgress(0);
    setMarkPaidHolding(false);
    setMarkPaidModal(true);
  }

  function handleHoldStart() {
    if (!markPaidPassword) {
      toast.error("Enter your password first");
      return;
    }
    setMarkPaidHolding(true);
    setMarkPaidProgress(0);

    let progress = 0;
    progressTimerRef.current = setInterval(() => {
      progress += 2;
      setMarkPaidProgress(progress);
      if (progress >= 100) {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      }
    }, 100);

    holdTimerRef.current = setTimeout(async () => {
      setMarkPaidHolding(false);
      setMarkPaidProgress(100);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      await confirmMarkAsPaid();
    }, 5000);
  }

  function handleHoldEnd() {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setMarkPaidHolding(false);
    setMarkPaidProgress(0);
  }

  async function confirmMarkAsPaid() {
    setMarkPaidLoading(true);
    try {
      const verifyRes = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: markPaidPassword }),
      });

      if (!verifyRes.ok) {
        toast.error("Invalid password");
        setMarkPaidPassword("");
        setMarkPaidProgress(0);
        return;
      }

      const patchRes = await fetch(`/api/invoices/${invoiceDetail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });

      if (!patchRes.ok) {
        toast.error("Failed to mark as paid");
        return;
      }

      toast.success("Invoice marked as paid");
      setMarkPaidModal(false);
      setMarkPaidPassword("");
      setMarkPaidProgress(0);
      fetchInvoices();
      handleViewDetail(invoiceDetail.id);
    } catch {
      toast.error("Failed to mark as paid");
    } finally {
      setMarkPaidLoading(false);
    }
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
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="outline" size="sm" disabled={exporting}>
                      <Download className="mr-2 h-4 w-4" />
                      {exporting ? "Exporting..." : "Export"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={exportPdf}>
                      <FileText className="mr-2 h-4 w-4" /> Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={exportPng}>
                      <Download className="mr-2 h-4 w-4" /> Download PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportJpg}>
                      <Download className="mr-2 h-4 w-4" /> Download JPG
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={exportTxt}>
                      <FileText className="mr-2 h-4 w-4" /> Download TXT
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" onClick={shareInvoice} disabled={exporting}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>

                {invoiceDetail.status !== "PAID" && (
                  <Button variant="outline" size="sm" onClick={openMarkPaidModal}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Paid
                  </Button>
                )}

                <Button variant="ghost" size="icon" onClick={() => setDetailModal(false)}>
                  <span className="sr-only">Close</span> X
                </Button>
              </div>
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

      {markPaidModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Mark as Paid</h2>
              <Button variant="ghost" size="icon" onClick={() => { setMarkPaidModal(false); handleHoldEnd(); }}>
                <span className="sr-only">Close</span> X
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Confirm payment for invoice <strong>{invoiceDetail?.invoiceNumber}</strong> ({formatCurrency(Number(invoiceDetail?.totalAmount || 0))}).
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Password *</label>
                <Input
                  type="password"
                  value={markPaidPassword}
                  onChange={(e) => setMarkPaidPassword(e.target.value)}
                  placeholder="Enter your password to confirm"
                  disabled={markPaidLoading}
                />
              </div>
              <div>
                <Button
                  className="w-full h-11 relative overflow-hidden"
                  onMouseDown={handleHoldStart}
                  onMouseUp={handleHoldEnd}
                  onMouseLeave={handleHoldEnd}
                  onTouchStart={handleHoldStart}
                  onTouchEnd={handleHoldEnd}
                  disabled={markPaidLoading || !markPaidPassword}
                >
                  <div
                    className="absolute inset-0 bg-green-500 transition-all duration-100"
                    style={{ width: `${markPaidProgress}%`, opacity: 0.3 }}
                  />
                  <span className="relative z-10">
                    {markPaidLoading
                      ? "Processing..."
                      : markPaidHolding
                      ? `Hold for ${Math.ceil((5000 - (markPaidProgress / 100) * 5000) / 1000)}s...`
                      : "Hold for 5 seconds to confirm"}
                  </span>
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Press and hold the button for 5 seconds to confirm payment
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailModal && invoiceDetail && (
        <div ref={exportRef} style={{ position: "fixed", left: -9999, top: 0, width: 800, background: "#ffffff", color: "#171717", padding: 40, fontFamily: "Arial, Helvetica, sans-serif", fontSize: 14, lineHeight: 1.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, borderBottom: "2px solid #2563eb", paddingBottom: 20 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#2563eb", marginBottom: 4 }}>{BIZ.name}</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>{BIZ.address}</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>{BIZ.phone} | {BIZ.email}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#171717", letterSpacing: 2 }}>INVOICE</div>
              <div style={{ fontFamily: "monospace", fontSize: 16, marginTop: 4, color: "#374151" }}>{invoiceDetail.invoiceNumber}</div>
              <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Date: {formatDate(invoiceDetail.createdAt)}</div>
              {invoiceDetail.dueDate && (
                <div style={{ color: "#6b7280", fontSize: 13 }}>Due: {formatDate(invoiceDetail.dueDate)}</div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Bill To</div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{invoiceDetail.customer?.name}</div>
              {invoiceDetail.customer?.company && <div style={{ color: "#374151" }}>{invoiceDetail.customer.company}</div>}
              <div style={{ color: "#6b7280", fontSize: 13 }}>{invoiceDetail.customer?.phone}</div>
              {invoiceDetail.customer?.email && <div style={{ color: "#6b7280", fontSize: 13 }}>{invoiceDetail.customer.email}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                display: "inline-block",
                padding: "4px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                color: invoiceDetail.status === "PAID" ? "#16a34a" : invoiceDetail.status === "OVERDUE" ? "#ef4444" : "#d97706",
                background: invoiceDetail.status === "PAID" ? "#dcfce7" : invoiceDetail.status === "OVERDUE" ? "#fee2e2" : "#fef3c7",
              }}>
                {invoiceDetail.status}
              </div>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ textAlign: "left", padding: "10px 0", color: "#6b7280", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Description</th>
                <th style={{ textAlign: "right", padding: "10px 0", color: "#6b7280", fontSize: 12, fontWeight: 600 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 0" }}>Subtotal</td>
                <td style={{ textAlign: "right", padding: "10px 0" }}>{formatCurrency(Number(invoiceDetail.subtotal || 0))}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 0" }}>Tax</td>
                <td style={{ textAlign: "right", padding: "10px 0" }}>{formatCurrency(Number(invoiceDetail.tax || 0))}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 0" }}>Discount</td>
                <td style={{ textAlign: "right", padding: "10px 0", color: "#ef4444" }}>-{formatCurrency(Number(invoiceDetail.discount || 0))}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
            <div style={{ width: 280 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontWeight: 600, fontSize: 16, borderTop: "2px solid #171717" }}>
                <span>Total</span>
                <span>{formatCurrency(Number(invoiceDetail.totalAmount))}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#16a34a" }}>
                <span>Paid</span>
                <span>{formatCurrency(Number(invoiceDetail.paidAmount || 0))}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontWeight: 700, color: "#ef4444", fontSize: 16 }}>
                <span>Due</span>
                <span>{formatCurrency(Number(invoiceDetail.dueAmount))}</span>
              </div>
            </div>
          </div>

          {invoiceDetail.notes && (
            <div style={{ marginBottom: 24, padding: 12, background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 4 }}>Notes</div>
              <div style={{ color: "#374151", fontSize: 13 }}>{invoiceDetail.notes}</div>
            </div>
          )}

          {invoiceDetail.payments?.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#171717", marginBottom: 8 }}>Payment History</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ textAlign: "left", padding: "6px 0", color: "#6b7280", fontSize: 11, fontWeight: 600 }}>Payment #</th>
                    <th style={{ textAlign: "left", padding: "6px 0", color: "#6b7280", fontSize: 11, fontWeight: 600 }}>Method</th>
                    <th style={{ textAlign: "right", padding: "6px 0", color: "#6b7280", fontSize: 11, fontWeight: 600 }}>Amount</th>
                    <th style={{ textAlign: "right", padding: "6px 0", color: "#6b7280", fontSize: 11, fontWeight: 600 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceDetail.payments.map((p: any) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "6px 0", fontFamily: "monospace", fontSize: 12 }}>{p.paymentNumber}</td>
                      <td style={{ padding: "6px 0", fontSize: 12 }}>{p.method}</td>
                      <td style={{ textAlign: "right", padding: "6px 0", fontSize: 12 }}>{formatCurrency(Number(p.amount))}</td>
                      <td style={{ textAlign: "right", padding: "6px 0", fontSize: 12, color: "#6b7280" }}>{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #e5e7eb", textAlign: "center", color: "#9ca3af", fontSize: 11 }}>
            Generated by {BIZ.name} | {BIZ.email} | {BIZ.phone}
          </div>
        </div>
      )}
    </div>
  );
}
