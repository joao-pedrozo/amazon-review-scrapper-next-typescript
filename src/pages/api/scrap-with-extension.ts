import { NextApiRequest, NextApiResponse } from "next/types";
import puppeteer from "puppeteer";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pathToExtension = path.join(process.cwd(), "sort-extension");

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  });

  const page = await browser.newPage();
  await page.goto(
    "https://www.amazon.com/s?i=specialty-aps&bbn=16225009011&rh=n%3A%2116225009011%2Cn%3A281407&s=review-count-rank&ref=nav_em__nav_desktop_sa_intl_accessories_and_supplies_0_2_5_2"
  );

  return res.status(200).json({ asd: "" });
}
