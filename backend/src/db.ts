// prisma client
import { PrismaClient } from "@prisma/client";
import { NODE_ENV } from "./config/env";
const prisma = new PrismaClient();

if (NODE_ENV !== "production") {
  prisma.$on("query", (e) => {
    // console.log("Prisma query:", e.query);
  });
}

export default prisma;
