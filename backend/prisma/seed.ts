import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const categories = [
  {
    key: "entrance",
    name: "Eingangsbereich",
    type: "room",
    templates: [
      {
        name: "Hauseingang",
        defaultName: "Eingang",
        defaultFloor: "EG",
      },
      {
        name: "Nebeneingang Garage",
      },
      {
        name: "Zugang Keller",
      },
      {
        name: "Eingang Gast",
      },
      {
        name: "Eingang Büro",
      },
    ],
  },
  {
    key: "cloakroom",
    name: "Garderobe",
    type: "room",
    templates: [
      {
        name: "Hauseingang",
        defaultName: "Garderobe",
        defaultFloor: "EG",
      },
      {
        name: "Nebeneingang Garage",
      },
      {
        name: "Zugang Keller",
      },
      {
        name: "Eingang Gast",
      },
      {
        name: "Eingang Büro",
      },
    ],
  },
  {
    key: "storageroom",
    name: "Abstellraum",
    type: "room",
    templates: [
      {
        name: "Abstellraum 1",
        defaultFloor: "EG",
      },
    ],
  },
  {
    key: "kitchen",
    name: "Küche",
    type: "module",
    templates: [
      {
        name: "Küche",
        defaultFloor: "EG",
      },
      {
        name: "Beiküche",
        defaultFloor: "EG",
      },
      {
        name: "Speisekammer",
        defaultFloor: "EG",
      },
    ],
  },
  {
    key: "bedroom",
    name: "Schlafzimmer",
    type: "room",
    templates: [
      {
        name: "Schlafzimmer 1",
        defaultFloor: "OG",
      },
      {
        name: "Ankleide 1",
        defaultFloor: "OG",
      },
    ],
  },
];

const furnitureByCategory = [
  {
    category: "Schlafzimmer",
    items: [
      {
        name: "Bett",
        width: 2.0,
        depth: 2.0,
        side1: 0.8,
        side2: 0.8,
        front: 0.5,
        back: 0,
      },
      {
        name: "Kleiderschrank",
        width: 3.0,
        depth: 0.6,
        side1: 0.5,
        side2: 0.5,
        front: 0.7,
        back: 0,
      },
    ],
  },
];

const kitchenStorageTypes = [
  {
    key: "countertop",
    name: "Arbeitsplatte",
  },
  {
    key: "tall_cabinet",
    name: "Hochschrank",
  },
  {
    key: "base_cabinet",
    name: "Unterschrank",
  },
  {
    key: "wall_cabinet",
    name: "Oberschrank",
  },
  {
    key: "glass_cabinet",
    name: "Glasschrank",
  },
];

const kitchenTemplates = [
  // Grossgeräte
  { group: "Großgeräte", name: "Spüle", defaultQuantity: 1, storageTypeKey: "countertop",   width: 1.0, depth: 0.6, height: 0.9 },
  { group: "Großgeräte", name: "Spülmaschine", defaultQuantity: 1, storageTypeKey: "base_cabinet", width: 0.6, depth: 0.6, height: 0.9 },
  { group: "Großgeräte", name: "2. Spüle",defaultQuantity: 0, storageTypeKey: "countertop",   width: 0.6, depth: 0.6, height: 0.9 },
// usw.

  //Kleingeräte
  { group: "Kleingeräte", name: "Kaffeeautomat", defaultQuantity: 1, storageTypeKey: "countertop",   width: 0.6, depth: 0.6 },
  { group: "Kleingeräte", name: "Kaffeemaschine", defaultQuantity: 1, storageTypeKey: "countertop",   width: 0.5, depth: 0.4 },
  { group: "Kleingeräte", name: "Wasserkocher", defaultQuantity: 1, storageTypeKey: "countertop",   width: 0.3, depth: 0.2 },

  //Töpfe
  { group: "Töpfe", name: "Schnellkochtopf 6 L", defaultQuantity: 1, storageTypeKey: "base_cabinet", width: 0.25, depth: 0.25, height: 0.25 },
  { group: "Töpfe", name: "Großer Topf 7-8 L", defaultQuantity: 1, storageTypeKey: "base_cabinet", width: 0.3,  depth: 0.3,  height: 0.25 },
  { group: "Töpfe", name: "Pastatopf hoch", defaultQuantity: 1, storageTypeKey: "base_cabinet", width: 0.25, depth: 0.25, height: 0.3 },
];

async function main() {
  for (const category of categories) {
    const existingCategory = await prisma.roomCategory.upsert({
      where: { name: category.name },
      update: {
        key: category.key,
        type: category.type,
      },
      create: {
        key: category.key,
        name: category.name,
        type: category.type,
      },
    });

    for (const template of category.templates) {
      await prisma.roomTemplate.upsert({
        where: {
          name_categoryId: {
            name: template.name,
            categoryId: existingCategory.id,
          },
        },
        update: {},
        create: {
          name: template.name,
          categoryId: existingCategory.id,
        },
      });
    }

    const furnitureConfig = furnitureByCategory.find(
      (f) => f.category === category.name
    );

    if (furnitureConfig) {
      await prisma.furnitureTemplate.createMany({
        data: furnitureConfig.items.map((item) => ({
          ...item,
          categoryId: existingCategory.id,
        })),
        skipDuplicates: true,
      });
    }
  }

  for (const storageType of kitchenStorageTypes) {
    await prisma.kitchenStorageType.upsert({
      where: { key: storageType.key },
      update: {
        name: storageType.name,
      },
      create: {
        key: storageType.key,
        name: storageType.name,
      },
    });
  }

  for (const template of kitchenTemplates) {
    const storageType = await prisma.kitchenStorageType.findUnique({
      where: { key: template.storageTypeKey },
    });

    if (!storageType) continue;

    await prisma.kitchenTemplate.upsert({
      where: {
        name: template.name,
      },
      update: {
        group: template.group,
        defaultQuantity: template.defaultQuantity,
        width: template.width,
        depth: template.depth,
        height: template.height,
        storageTypeId: storageType.id,
      },
      create: {
        name: template.name,
        group: template.group,
        defaultQuantity: template.defaultQuantity,
        width: template.width,
        depth: template.depth,
        height: template.height,
        storageTypeId: storageType.id,
      },
    });
  }


  console.log("Seed erfolgreich 🚀");
}

main()
  .catch((e) => {
    console.error("Fehler beim Seed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });