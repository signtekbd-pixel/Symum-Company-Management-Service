import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

async function ensureSeeded() {
  const userCount = await prisma.user.count();
  if (userCount > 0) return;

  // Auto-seed: create roles, branch, and admin user
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
