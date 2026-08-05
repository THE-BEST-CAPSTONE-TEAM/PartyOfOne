import prisma from "../db/prisma.js";

export async function getHealth(_req, res) {
  res.json({ status: "ok" });
}

// export async function getItems(_req, res, next) {
//   try {
//     const items = await prisma.item.findMany({
//       include: {
//         category: true
//       },
//       orderBy: {
//         id: "asc"
//       }
//     });

//     res.json(items);
//   } catch (error) {
//     next(error);
//   }
// }

