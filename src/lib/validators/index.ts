import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  altPhone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  type: z.enum(["INDIVIDUAL", "BUSINESS", "CORPORATE"]).default("INDIVIDUAL"),
  creditLimit: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  priceTemplateId: z.string().optional(),
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Price must be positive"),
  discount: z.number().min(0).default(0),
  specifications: z.any().optional(),
  fileUrl: z.string().optional(),
});

export const orderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  branchId: z.string().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  notes: z.string().optional(),
  specialInstructions: z.string().optional(),
  dueDate: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryMethod: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export const materialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  categoryId: z.string().min(1, "Category is required"),
  unit: z.string().default("sheet"),
  description: z.string().optional(),
  minStockLevel: z.number().min(0).default(10),
  maxStockLevel: z.number().min(0).default(1000),
  reorderPoint: z.number().min(0).default(50),
  costPrice: z.number().min(0, "Price must be positive"),
  branchId: z.string().optional(),
});

export const invoiceSchema = z.object({
  orderId: z.string().optional(),
  customerId: z.string().min(1, "Customer is required"),
  subtotal: z.number().min(0),
  tax: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  method: z.enum([
    "CASH",
    "BKASH",
    "NAGAD",
    "ROCKET",
    "BANK_TRANSFER",
    "CHEQUE",
    "ADVANCE",
    "OTHER",
  ]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const proofSchema = z.object({
  orderId: z.string().min(1, "Order is required"),
  customerId: z.string().min(1, "Customer is required"),
  orderItemId: z.string().optional(),
  fileUrl: z.string().min(1, "File is required"),
  notes: z.string().optional(),
});

export const productionJobSchema = z.object({
  orderId: z.string().min(1, "Order is required"),
  orderItemId: z.string().optional(),
  machineId: z.string().optional(),
  operatorId: z.string().optional(),
  estimatedHours: z.number().optional(),
  notes: z.string().optional(),
});
