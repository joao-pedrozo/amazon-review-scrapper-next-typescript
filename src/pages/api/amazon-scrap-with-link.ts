import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import getProductDescription from "~/server/puppeteer/getProductDescription";
import puppeteer from "puppeteer";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const AMOUNT_OF_LINKS_TO_SCRAPE = 1;

  const linksToScrape = await prisma.linkToScrap.findMany({
    take: AMOUNT_OF_LINKS_TO_SCRAPE,
    where: {
      scrapped: false,
    },
  });

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });

  linksToScrape.forEach(async (linkToScrape) => {
    const page = await browser.newPage();
    await page.goto(linkToScrape.url);
    getProductDescription(page, browser, linkToScrape.id);
  });

  return res.status(200).json({ asd: "" });
}
