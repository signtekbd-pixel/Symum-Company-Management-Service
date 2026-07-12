import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create roles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "SUPER_ADMIN" },
      update: {},
      create: { name: "SUPER_ADMIN", description: "Super Administrator" },
    }),
    prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN", description: "Administrator" },
    }),
    prisma.role.upsert({
      where: { name: "MANAGER" },
      update: {},
      create: { name: "MANAGER", description: "Production Manager" },
    }),
    prisma.role.upsert({
      where: { name: "SALES" },
      update: {},
      create: { name: "SALES", description: "Sales Representative" },
    }),
    prisma.role.upsert({
      where: { name: "OPERATOR" },
      update: {},
      create: { name: "OPERATOR", description: "Machine Operator" },
    }),
    prisma.role.upsert({
      where: { name: "CUSTOMER" },
      update: {},
      create: { name: "CUSTOMER", description: "Customer Portal User" },
    }),
  ]);

  console.log("Roles created:", roles.map((r) => r.name).join(", "));

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@prinerp.com" },
    update: {},
    create: {
      email: "admin@prinerp.com",
      name: "Admin User",
      password: adminPassword,
      phone: "+8801712345678",
      roleId: roles[0].id, // SUPER_ADMIN
    },
  });

  console.log("Admin user created:", admin.email);

  // Create demo branch
  const branch = await prisma.branch.upsert({
    where: { code: "DHK01" },
    update: {},
    create: {
      name: "Dhaka Main Branch",
      code: "DHK01",
      address: "123 Print Street, Dhaka 1000",
      phone: "+8801712345678",
      email: "dhk@prinerp.com",
    },
  });

  console.log("Branch created:", branch.name);

  // Create product categories
  const categories = await Promise.all([
    prisma.productCategory.upsert({
      where: { name: "Business Cards" },
      update: {},
      create: { name: "Business Cards" },
    }),
    prisma.productCategory.upsert({
      where: { name: "Flyers & Brochures" },
      update: {},
      create: { name: "Flyers & Brochures" },
    }),
    prisma.productCategory.upsert({
      where: { name: "Banners & Signs" },
      update: {},
      create: { name: "Banners & Signs" },
    }),
    prisma.productCategory.upsert({
      where: { name: "Stationery" },
      update: {},
      create: { name: "Stationery" },
    }),
    prisma.productCategory.upsert({
      where: { name: "Packaging" },
      update: {},
      create: { name: "Packaging" },
    }),
  ]);

  console.log("Categories created:", categories.map((c) => c.name).join(", "));

  // Create products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: "product-seed-1" },
      update: {},
      create: {
        id: "product-seed-1",
        name: "Standard Business Card",
        categoryId: categories[0].id,
        basePrice: 500,
        unit: "piece",
        minQuantity: 100,
        leadTimeDays: 1,
      },
    }),
    prisma.product.upsert({
      where: { id: "product-seed-2" },
      update: {},
      create: {
        id: "product-seed-2",
        name: "Premium Business Card",
        categoryId: categories[0].id,
        basePrice: 1200,
        unit: "piece",
        minQuantity: 100,
        leadTimeDays: 2,
      },
    }),
    prisma.product.upsert({
      where: { id: "product-seed-3" },
      update: {},
      create: {
        id: "product-seed-3",
        name: "A4 Flyer",
        categoryId: categories[1].id,
        basePrice: 300,
        unit: "piece",
        minQuantity: 50,
        leadTimeDays: 1,
      },
    }),
    prisma.product.upsert({
      where: { id: "product-seed-4" },
      update: {},
      create: {
        id: "product-seed-4",
        name: "A5 Brochure",
        categoryId: categories[1].id,
        basePrice: 800,
        unit: "piece",
        minQuantity: 100,
        leadTimeDays: 2,
      },
    }),
    prisma.product.upsert({
      where: { id: "product-seed-5" },
      update: {},
      create: {
        id: "product-seed-5",
        name: "Vinyl Banner (per sqft)",
        categoryId: categories[2].id,
        basePrice: 150,
        unit: "sqft",
        minQuantity: 10,
        leadTimeDays: 1,
      },
    }),
  ]);

  console.log("Products created:", products.map((p) => p.name).join(", "));

  // Create material categories
  const materialCategories = await Promise.all([
    prisma.materialCategory.upsert({
      where: { name: "Paper" },
      update: {},
      create: { name: "Paper" },
    }),
    prisma.materialCategory.upsert({
      where: { name: "Ink" },
      update: {},
      create: { name: "Ink" },
    }),
    prisma.materialCategory.upsert({
      where: { name: "Vinyl" },
      update: {},
      create: { name: "Vinyl" },
    }),
  ]);

  // Create materials
  const materials = await Promise.all([
    prisma.material.upsert({
      where: { code: "PAP-A4-80" },
      update: {},
      create: {
        name: "A4 Copy Paper 80gsm",
        code: "PAP-A4-80",
        categoryId: materialCategories[0].id,
        unit: "ream",
        costPrice: 450,
        minStockLevel: 50,
        maxStockLevel: 500,
        reorderPoint: 100,
        branchId: branch.id,
      },
    }),
    prisma.material.upsert({
      where: { code: "PAP-A4-GL150" },
      update: {},
      create: {
        name: "A4 Glossy Paper 150gsm",
        code: "PAP-A4-GL150",
        categoryId: materialCategories[0].id,
        unit: "sheet",
        costPrice: 15,
        minStockLevel: 100,
        maxStockLevel: 5000,
        reorderPoint: 500,
        branchId: branch.id,
      },
    }),
    prisma.material.upsert({
      where: { code: "INK-CMYK" },
      update: {},
      create: {
        name: "CMYK Ink Set",
        code: "INK-CMYK",
        categoryId: materialCategories[1].id,
        unit: "set",
        costPrice: 12000,
        minStockLevel: 5,
        maxStockLevel: 20,
        reorderPoint: 8,
        branchId: branch.id,
      },
    }),
  ]);

  console.log("Materials created:", materials.map((m) => m.name).join(", "));

  // Create demo customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { id: "customer-seed-1" },
      update: {},
      create: {
        id: "customer-seed-1",
        name: "Rahman Printers",
        phone: "+8801711111111",
        email: "rahman@printers.com",
        company: "Rahman Printers Ltd",
        type: "BUSINESS",
        creditLimit: 500000,
      },
    }),
    prisma.customer.upsert({
      where: { id: "customer-seed-2" },
      update: {},
      create: {
        id: "customer-seed-2",
        name: "ABC Corporation",
        phone: "+8801722222222",
        email: "info@abccorp.com",
        company: "ABC Corporation",
        type: "CORPORATE",
        creditLimit: 1000000,
      },
    }),
    prisma.customer.upsert({
      where: { id: "customer-seed-3" },
      update: {},
      create: {
        id: "customer-seed-3",
        name: "Digital World",
        phone: "+8801733333333",
        email: "contact@digitalworld.com",
        type: "BUSINESS",
        creditLimit: 200000,
      },
    }),
  ]);

  console.log("Customers created:", customers.map((c) => c.name).join(", "));

  // Create demo machines
  const machines = await Promise.all([
    prisma.machine.upsert({
      where: { code: "MCH-001" },
      update: {},
      create: {
        name: "HP Indigo Press",
        code: "MCH-001",
        type: "digital_press",
        status: "AVAILABLE",
        branchId: branch.id,
      },
    }),
    prisma.machine.upsert({
      where: { code: "MCH-002" },
      update: {},
      create: {
        name: "Canon imagePRESS",
        code: "MCH-002",
        type: "digital_press",
        status: "IN_USE",
        branchId: branch.id,
      },
    }),
    prisma.machine.upsert({
      where: { code: "MCH-003" },
      update: {},
      create: {
        name: "Epson SureColor",
        code: "MCH-003",
        type: "digital_press",
        status: "AVAILABLE",
        branchId: branch.id,
      },
    }),
  ]);

  console.log("Machines created:", machines.map((m) => m.name).join(", "));

  console.log("\n✓ Database seeded successfully!");
  console.log("\nDemo credentials:");
  console.log("  Email: admin@prinerp.com");
  console.log("  Password: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
