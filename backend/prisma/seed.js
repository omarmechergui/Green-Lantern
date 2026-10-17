
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const categories = [
  {
    name: "Plastic",
    description: "Plastic bottles, containers, and recyclable packaging",
    pointsPerKg: 10,
    icon: "♻️",
  },
  {
    name: "Paper",
    description: "Paper, newspapers, and cardboard",
    pointsPerKg: 10,
    icon: "📄",
  },
  {
    name: "Glass",
    description: "Glass bottles and jars",
    pointsPerKg: 15,
    icon: "🍾",
  },
  {
    name: "Metal",
    description: "Aluminum cans and recyclable metal",
    pointsPerKg: 20,
    icon: "🥫",
  },
  {
    name: "Electronic Waste",
    description: "Small electronic devices and recyclable electronic waste",
    pointsPerKg: 25,
    icon: "🔌",
  },
];

async function main() {
  for (const category of categories) {
    await prisma.wasteCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log(`Seed completed: ${categories.length} waste categories checked.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });