import { NextApiRequest, NextApiResponse } from "next";
import puppeteer, { Frame, Page } from "puppeteer";

interface Review {
  rating: number;
  description: string | null;
  images: string[];
}

async function bypassCaptcha(iframe: Frame, page: Page) {
  iframe.waitForSelector("#nocaptcha").then(async (captcha) => {
    const slidebtn = await iframe.$(".btn_slide");
    console.log("slidebtn=>", slidebtn?.boundingBox());
    slidebtn?.boundingBox();
    const spanInfo = await slidebtn?.boundingBox();

    const sliderElement = await iframe.$(".slidetounlock");
    const slider = await sliderElement!.boundingBox();

    const sliderHandle = await iframe.$(".nc_iconfont.btn_slide");
    const handle = await sliderHandle!.boundingBox();

    sliderHandle!.focus();

    await page.mouse.move(
      handle!.x + handle!.width / 2,
      handle!.y + handle!.height / 2
    );
    await page.waitForTimeout(1000);
    await page.mouse.down();
    await page.mouse.move(
      handle!.x + slider!.width,
      handle!.y + handle!.height / 2,
      { steps: 20 }
    );
    await page.mouse.up();

    await page.waitForTimeout(3000);

    await page.mouse.up();

    console.log("bypassed");
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  // Necessary for captcha validation
  await page.evaluate(() => {
    Object.defineProperties(navigator, { webdriver: { get: () => false } });
  });

  // Necessary for captcha validation
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4],
    });
  });

  // Necessary for captcha validation
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36"
  );

  // Necessary for captcha validation
  // await page.evaluate(() => {
  //   window.navigator.chrome = { runtime: {} };
  // });

  // Necessary for captcha validation
  await page.evaluate(() => {
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3],
    });
  });

  // await page.goto("https://pt.aliexpress.com/item/1005003860281880.html", {
  //   waitUntil: "networkidle2",
  // });
  await page.goto("https://pt.aliexpress.com/item/1005004894817371.html", {
    waitUntil: "networkidle2",
  });

  let reviews: Review[] = [];

  const el = await page.$(".product-reviewer-reviews");
  await el?.click();

  await page.waitForSelector("#product-evaluation", { timeout: 5000 });

  const reviewsIframeElement = await page.$("#product-evaluation");
  const iframe = await reviewsIframeElement?.contentFrame();

  await iframe
    ?.waitForSelector(".feedback-item", { timeout: 2000 })
    .catch(async () => {
      await bypassCaptcha(iframe, page);
    });

  const printReviews = async (reviewsPage = 1) => {
    console.log(reviewsPage);

    await iframe?.$(".ui-pagination-next").then(async (button) => {
      if (reviewsPage > 1) {
        await button?.evaluate((b) => (b as HTMLElement).click());
        await iframe.waitForTimeout(3000);
      }

      await iframe.waitForSelector(".feedback-item").catch(() => {
        console.log(123);
        // iframe.waitForSelector("#nocaptcha").then(async (captcha) => {
        //   await bypassCaptcha(iframe, page);
        // });
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

          const description =
            node.querySelector(".fb-main .f-content dl dt span")?.textContent ||
            null;

          const imageNodes: NodeListOf<Element> =
            node.querySelectorAll(".fb-main .f-content dl dd ul li") || [];

          const imagesUrls = Array.from(imageNodes)
            .map((imageNode) => {
              return imageNode.querySelector("img")?.getAttribute("src");
            })
            .filter((url) => url) as string[];

          return {
            rating,
            description,
            images: imagesUrls,
          };
        });
      });

      reviews = [...reviews, ...elements];

      // Verify with puppeteer if there is a .ui-pagination-next.ui-pagination-disabled element
      const isLastPage = await iframe?.$(
        ".ui-pagination-next.ui-pagination-disabled"
      );

      if (isLastPage) {
        return;
      }

      await printReviews(reviewsPage + 1);
    });
  };

  await printReviews();

  await browser.close();

  return res.status(200).json({ reviews });
}
