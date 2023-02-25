import { NextApiRequest, NextApiResponse } from "next";
import puppeteer, { Frame, Page } from "puppeteer";

async function bypassCaptcha(iframe: Frame, page: Page) {
  iframe.waitForSelector("#nocaptcha").then(async (captcha) => {
    const sliderElement = await iframe.$(".slidetounlock");
    const slider = await sliderElement!.boundingBox();

    const sliderHandle = await iframe.$(".btn_slide");
    const handle = await sliderHandle!.boundingBox();

    await page.mouse.move(
      handle!.x + handle!.width / 2,
      handle!.y + handle!.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      handle!.x + slider!.width,
      handle!.y + handle!.height / 2,
      { steps: 50 }
    );
    await page.mouse.up();

    await page.waitForNavigation({
      waitUntil: "load",
    });

    console.log("bypassed");
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1366, height: 768 },
  });
  const page = await browser.newPage();

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });

  await page.goto("https://pt.aliexpress.com/item/1005003860281880.html");

  const el = await page.$(".product-reviewer-reviews");
  await el?.click();

  await page.waitForSelector("#product-evaluation", { timeout: 5000 });

  const reviewsIframeElement = await page.$("#product-evaluation");
  const iframe = await reviewsIframeElement?.contentFrame();

  await iframe?.waitForSelector(".feedback-item").catch(async () => {
    await bypassCaptcha(iframe, page);
  });

  const printReviews = async (reviewsPage = 1) => {
    await iframe?.$(".ui-pagination-next").then(async (button) => {
      if (reviewsPage > 1) {
        await button?.evaluate((b) => (b as HTMLElement).click());
        await iframe.waitForTimeout(2000);
      }

      await iframe.waitForSelector(".feedback-item").catch(() => {
        iframe.waitForSelector("#nocaptcha").then(async (captcha) => {
          const sliderElement = await iframe.$(".slidetounlock");
          const slider = await sliderElement!.boundingBox();

          const sliderHandle = await iframe.$(".btn_slide");
          const handle = await sliderHandle!.boundingBox();

          await page.mouse.move(
            handle!.x + handle!.width / 2,
            handle!.y + handle!.height / 2
          );
          await page.mouse.down();
          await page.mouse.move(
            handle!.x + slider!.width,
            handle!.y + handle!.height / 2,
            { steps: 50 }
          );
          await page.mouse.up();

          await page.waitForNavigation({
            waitUntil: "load",
          });

          console.log("aqui");
        });
      });
      const elements = await iframe.$$eval(".feedback-item", (nodes) => {
        const widthToRating = {
          "100%": 5,
          "80%": 4,
          "60%": 3,
          "40%": 2,
          "20%": 1,
        };

        return nodes.map((node: Element) => {
          const rating =
            widthToRating[
              (
                node.querySelector(
                  ".fb-main .f-rate-info span span"
                ) as HTMLElement
              ).style.width as keyof typeof widthToRating
            ];

          const description = node.querySelector(
            ".fb-main .f-content dl dt span"
          )!.textContent;

          const imageNodes: NodeListOf<Element> = node.querySelectorAll(
            ".fb-main .f-content dl dd ul li"
          );

          const imagesUrls = Array.from(imageNodes).map((imageNode) => {
            return imageNode.querySelector("img")!.getAttribute("src");
          });

          return {
            rating,
            description,
            images: imagesUrls,
          };
        });
      });

      printReviews(reviewsPage + 1);
    });
  };

  printReviews();

  return res.status(200).json({ name: "John Doe" });
}
