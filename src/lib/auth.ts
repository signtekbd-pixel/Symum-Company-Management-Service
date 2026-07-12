import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

async function ensureSeeded() {
  // Always run upserts — idempotent, safe to call multiple times
  // This fixes partial seed failures from Neon cold-start timeouts
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: "DEV" }, update: {}, create: { name: "DEV", description: "Developer - Full System Access" } }),
    prisma.role.upsert({ where: { name: "ADMIN" }, update: {}, create: { name: "ADMIN", description: "Administrator" } }),
    prisma.role.upsert({ where: { name: "MANAGER" }, update: {}, create: { name: "MANAGER", description: "Production Manager" } }),
    prisma.role.upsert({ where: { name: "SALES" }, update: {}, create: { name: "SALES", description: "Sales Representative" } }),
    prisma.role.upsert({ where: { name: "OPERATOR" }, update: {}, create: { name: "OPERATOR", description: "Machine Operator" } }),
    prisma.role.upsert({ where: { name: "CUSTOMER" }, update: {}, create: { name: "CUSTOMER", description: "Customer Portal User" } }),
  ]);

  const branch = await prisma.branch.upsert({
    where: { code: "DHK01" },
    update: {},
    create: { name: "Dhaka Main Branch", code: "DHK01", address: "123 Print Street, Dhaka 1000", phone: "+8801712345678", email: "dhk@prinerp.com" },
  });

  const adminPassword = await bcrypt.hash("admin123", 12);

  // DEV user
  await prisma.user.upsert({
    where: { email: "admin@prinerp.com" },
    update: {},
    create: {
      email: "admin@prinerp.com",
      name: "Admin User",
      password: adminPassword,
      phone: "+8801712345678",
      roleId: roles[0].id,
      branchId: branch.id,
    },
  });

  // ADMIN user
  await prisma.user.upsert({
    where: { email: "admin2@prinerp.com" },
    update: {},
    create: {
      email: "admin2@prinerp.com",
      name: "Office Admin",
      password: adminPassword,
      phone: "+8801712345679",
      roleId: roles[1].id,
      branchId: branch.id,
    },
  });

  // MANAGER user
  await prisma.user.upsert({
    where: { email: "manager@prinerp.com" },
    update: {},
    create: {
      email: "manager@prinerp.com",
      name: "Production Manager",
      password: adminPassword,
      phone: "+8801712345680",
      roleId: roles[2].id,
      branchId: branch.id,
    },
  });

  // SALES user
  await prisma.user.upsert({
    where: { email: "sales@prinerp.com" },
    update: {},
    create: {
      email: "sales@prinerp.com",
      name: "Sales Rep",
      password: adminPassword,
      phone: "+8801712345681",
      roleId: roles[3].id,
      branchId: branch.id,
    },
  });

  // OPERATOR user
  await prisma.user.upsert({
    where: { email: "operator@prinerp.com" },
    update: {},
    create: {
      email: "operator@prinerp.com",
      name: "Machine Operator",
      password: adminPassword,
      phone: "+8801712345682",
      roleId: roles[4].id,
      branchId: branch.id,
    },
  });

  // CUSTOMER user
  await prisma.user.upsert({
    where: { email: "customer@prinerp.com" },
    update: {},
    create: {
      email: "customer@prinerp.com",
      name: "Customer User",
      password: adminPassword,
      phone: "+8801712345683",
      roleId: roles[5].id,
      branchId: branch.id,
    },
  });

  // Seed product categories
  await Promise.all([
    prisma.productCategory.upsert({ where: { name: "Business Cards" }, update: {}, create: { name: "Business Cards" } }),
    prisma.productCategory.upsert({ where: { name: "Flyers & Brochures" }, update: {}, create: { name: "Flyers & Brochures" } }),
    prisma.productCategory.upsert({ where: { name: "Banners & Signs" }, update: {}, create: { name: "Banners & Signs" } }),
    prisma.productCategory.upsert({ where: { name: "Stationery" }, update: {}, create: { name: "Stationery" } }),
    prisma.productCategory.upsert({ where: { name: "Packaging" }, update: {}, create: { name: "Packaging" } }),
  ]);

  // Seed customers
  await Promise.all([
    prisma.customer.upsert({ where: { id: "customer-seed-1" }, update: {}, create: { id: "customer-seed-1", name: "Rahman Printers", phone: "+8801711111111", email: "rahman@printers.com", company: "Rahman Printers Ltd", type: "BUSINESS", creditLimit: 500000 } }),
    prisma.customer.upsert({ where: { id: "customer-seed-2" }, update: {}, create: { id: "customer-seed-2", name: "ABC Corporation", phone: "+8801722222222", email: "info@abccorp.com", company: "ABC Corporation", type: "CORPORATE", creditLimit: 1000000 } }),
    prisma.customer.upsert({ where: { id: "customer-seed-3" }, update: {}, create: { id: "customer-seed-3", name: "Digital World", phone: "+8801733333333", email: "contact@digitalworld.com", type: "BUSINESS", creditLimit: 200000 } }),
  ]);

  // Seed system settings
  const systemSettings = [
    { key: "business_name", value: "PrintERP Ltd", description: "Company name displayed on invoices and reports" },
    { key: "business_email", value: "info@prinerp.com", description: "Primary business email" },
    { key: "business_phone", value: "+8801712345678", description: "Primary business phone" },
    { key: "business_address", value: "123 Print Street, Dhaka", description: "Business address" },
    { key: "currency", value: "BDT", description: "Currency code (BDT, USD, EUR)" },
    { key: "tax_rate", value: "15", description: "Default tax rate percentage" },
    { key: "low_stock_threshold", value: "10", description: "Alert when material stock falls below this" },
    { key: "order_prefix", value: "ORD", description: "Prefix for order numbers" },
    { key: "invoice_prefix", value: "INV", description: "Prefix for invoice numbers" },
    { key: "require_approval_deletes", value: "true", description: "Require DEV approval for bulk deletes" },
  ];

  await Promise.all(
    systemSettings.map((s) =>
      prisma.systemSetting.upsert({
        where: { key: s.key },
        update: {},
        create: s,
      })
    )
  );

  console.log("Auto-seeded database on first login");
}

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Auto-seed if database is empty
          await ensureSeeded();

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            include: { role: true },
          });

          if (!user || !user.isActive) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.name,
          };
        } catch (dbError) {
          console.error("Database error during auth:", dbError);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
