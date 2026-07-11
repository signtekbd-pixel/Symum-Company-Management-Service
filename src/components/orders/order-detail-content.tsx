"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Package, Clock, CheckCircle, Truck, AlertTriangle,
  Play, Pause, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatDate, formatCurrency, getStatusColor, getPriorityColor } from "@/lib/utils";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  specifications: any;
  status: string;
  product: { name: string; unit: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  priority: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  notes: string | null;
  specialInstructions: string | null;
  dueDate: string | null;
  deliveryAddress: string | null;
  deliveryMethod: string | null;
  confirmedAt: string | null;
  productionStartedAt: string | null;
  completedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  customer: { name: string; phone: string; email: string | null; company: string | null };
  items: OrderItem[];
  productionJobs: { id: string; status: string; progress: number; machine: { name: string } | null }[];
  proofs: { id: string; status: string; version: number }[];
}

const statusSteps = [
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle },
  { key: "IN_PRODUCTION", label: "In Production", icon: Play },
  { key: "QUALITY_CHECK", label: "Quality Check", icon: Eye },
  { key: "READY", label: "Ready", icon: Package },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle },
];

export function OrderDetailContent() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);

  React.useEffect(() => {
    fetchOrder();
  }, [params.id]);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrder();
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!order) {
    return <div className="text-center p-8 text-gray-500">Order not found.</div>;
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  function getNextStatus(): string | null {
    const flows: Record<string, string> = {
      DRAFT: "CONFIRMED",
      CONFIRMED: "IN_PRODUCTION",
      IN_PRODUCTION: "QUALITY_CHECK",
      QUALITY_CHECK: "READY",
      READY: "OUT_FOR_DELIVERY",
      OUT_FOR_DELIVERY: "DELIVERED",
    };
    return flows[order!.status] || null;
  }

  function getCancelStatus(): string | null {
    if (["DELIVERED", "CANCELLED"].includes(order!.status)) return null;
    return "CANCELLED";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-gray-500">Created {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status.replace(/_/g, " ")}
          </span>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(order.priority)}`}>
            {order.priority}
          </span>
        </div>
      </div>

      {/* Status Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
              const isActive = index <= currentStepIndex;
              const isCurrent = step.key === order.status;
              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-full ${isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"} ${isCurrent ? "ring-2 ring-blue-500" : ""}`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs font-medium ${isActive ? "text-blue-600" : "text-gray-400"}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${index < currentStepIndex ? "bg-blue-500" : "bg-gray-200"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{order.customer.name}</p>
            <p className="text-sm text-gray-500">{order.customer.phone}</p>
            {order.customer.email && <p className="text-sm text-gray-500">{order.customer.email}</p>}
            {order.customer.company && <p className="text-sm text-gray-500">{order.customer.company}</p>}
            {order.deliveryAddress && (
              <div className="mt-3 p-2 rounded bg-gray-50">
                <p className="text-xs text-gray-500">Delivery Address:</p>
                <p className="text-sm">{order.deliveryAddress}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatCurrency(Number(order.subtotal))}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-red-600">-{formatCurrency(Number(order.discount))}</span>
              </div>
            )}
            {Number(order.tax) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span>{formatCurrency(Number(order.tax))}</span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold text-lg">{formatCurrency(Number(order.totalAmount))}</span>
            </div>
            {order.dueDate && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <Clock className="h-4 w-4" />
                Due: {formatDate(order.dueDate)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {getNextStatus() && (
              <Button
                className="w-full"
                onClick={() => updateStatus(getNextStatus()!)}
                disabled={updating}
              >
                {updating ? "Updating..." : `Mark as ${getNextStatus()!.replace(/_/g, " ")}`}
              </Button>
            )}
            {getCancelStatus() && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => updateStatus(getCancelStatus()!)}
                disabled={updating}
              >
                Cancel Order
              </Button>
            )}
            <div className="text-xs text-gray-500 space-y-1">
              {order.confirmedAt && <p>Confirmed: {formatDate(order.confirmedAt)}</p>}
              {order.productionStartedAt && <p>Production started: {formatDate(order.productionStartedAt)}</p>}
              {order.completedAt && <p>Completed: {formatDate(order.completedAt)}</p>}
              {order.deliveredAt && <p>Delivered: {formatDate(order.deliveredAt)}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items ({order.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.product.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(Number(item.unitPrice))}</TableCell>
                  <TableCell>{Number(item.discount) > 0 ? `-${formatCurrency(Number(item.discount))}` : "-"}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(Number(item.totalPrice))}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Production Jobs */}
      {order.productionJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Production Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.productionJobs.map((job) => (
                <div key={job.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium">{job.machine?.name || "Unassigned"}</p>
                    <p className="text-sm text-gray-500">{job.status.replace(/_/g, " ")}</p>
                  </div>
                  <div className="w-32">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${job.progress}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 text-right mt-1">{job.progress}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {(order.notes || order.specialInstructions) && (
        <Card>
          <CardHeader>
            <CardTitle>Notes & Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.notes && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Notes:</p>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}
            {order.specialInstructions && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Special Instructions:</p>
                <p className="text-sm p-2 rounded bg-yellow-50 border border-yellow-200">{order.specialInstructions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
