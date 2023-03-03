import { NextApiRequest, NextApiResponse } from "next";
import amazon from "../../../amazon-links.json";
import { PrismaClient } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const ROUND_SIZE = 1;
  const rounds = Math.ceil(amazon.length / ROUND_SIZE);
  const iterableRounds = [...Array(rounds)].map((round, index) => index);
  const prisma = new PrismaClient();

  for await (const round of iterableRounds) {
    console.log("Initiaing round ", round + 1);

    const roundArticles =
      round === 0
        ? amazon.slice(0, (round + 1) * ROUND_SIZE)
        : amazon.slice(round * ROUND_SIZE, (round + 1) * ROUND_SIZE);

    await Promise.allSettled(
      roundArticles.map(
        (amazonLink) =>
          new Promise(async (resolve, reject) => {
            try {
              const linkToScrap = await prisma.linkToScrap.create({
                data: {
                  url: amazonLink.Link,
                  departament: {
                    connectOrCreate: {
                      create: {
                        name: amazonLink.Departament,
                      },
                      where: {
                        name: amazonLink.Departament,
                      },
                    },
                  },
                },
              });

              resolve(linkToScrap);
            } catch (err) {
              reject(err);
            }
          })
      )
    );
  }

  return res.status(200).json({ asd: "" });
}
