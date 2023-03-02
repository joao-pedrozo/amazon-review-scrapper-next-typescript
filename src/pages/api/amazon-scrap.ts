import { type NextApiRequest, type NextApiResponse } from "next";
import puppeteer from "puppeteer";
import selectAndOpenDepartament from "~/server/puppeteer/selectAndOpenDepartament";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });

  Array.from({ length: 10 }).forEach(async () => {
    await selectAndOpenDepartament(browser);
  });

  return res.status(200).json({ asd: "" });
}
