import { type Page, type Browser, type ElementHandle } from "puppeteer";
import getProductDescription from "./getProductDescription";
import { PrismaClient } from "@prisma/client";

const departaments = [
  "Appliances",
  "Amazon Devices & Accessories",
  "Arts, Crafts & Sewing",
  "Automotive",
  "Baby",
  "Beauty & Personal Care",
  "Camera & Photo Products",
  "Cell Phones & Accessories",
  "Computers & Accessories",
  "Electronics",
  "Home & Kitchen",
  "Industrial & Scientific",
  "Kitchen & Dining",
  "Office Products",
  "Patio, Lawn & Garden",
  "Pet Supplies",
  "Sports & Outdoors",
  "Tools & Home Improvement",
  "Toys & Games",
];

async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve({});
        }
      }, 50);
    });
  });
}

const filterAsync = async <T>(
  arr: T[],
  predicate: (item: T) => Promise<boolean>
): Promise<T[]> => {
  const results = await Promise.all(arr.map(predicate));
  return arr.filter((_, index) => results[index]);
};

const prisma = new PrismaClient();

const selectAndOpenDepartament = async (
  browser: Browser,
  previousPage?: Page
) => {
  let page: Page;

  // We are doing this because of headless mode

  if (!previousPage) {
    // page = (await browser.pages())[0]!;
    page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.resourceType() === "image") request.abort();
      else request.continue();
    });
  } else {
    page = previousPage;
  }

  await page.goto("https://www.amazon.com/Best-Sellers/zgbs");

  const randomIndex = Math.floor(Math.random() * departaments.length);
  const randomDepartament = departaments[randomIndex] as string;

  const [departament] = await page?.$x(
    `//a[contains(., '${randomDepartament}')]`
  );

  if (departament) {
    await (departament as ElementHandle<Element>).click();
  }

  await page.waitForNavigation();

  await autoScroll(page);

  const productsWithEnoughReviews = await filterAsync(
    await page.$$("#gridItemRoot"),
    async (product) => {
      const MINIMUM_AMOUNT_OF_REVIEWS = 10000;

      const reviewsAmountElement = await product.$(
        ".a-link-normal .a-size-small"
      );

      const reviewsAmount = Number(
        await reviewsAmountElement?.evaluate((node) =>
          node.textContent?.replace(",", "")
        )
      );

      return reviewsAmount >= MINIMUM_AMOUNT_OF_REVIEWS;
    }
  );

  const productsNotAlreadyScraped = await filterAsync(
    productsWithEnoughReviews,
    async (product) => {
      const productName = await product.evaluate(
        (node) =>
          node
            .querySelectorAll<HTMLElement>(".a-link-normal")[1]
            ?.innerText?.replace(/\s+/g, " ")
            .trim() as string
      );

      const productAlreadyScraped = await prisma.product.findFirst({
        where: {
          name: productName,
        },
      });

      return !productAlreadyScraped;
    }
  );

  const randomProductIndex = Math.floor(
    Math.random() * productsNotAlreadyScraped.length
  );

  const randomProduct = productsNotAlreadyScraped[randomProductIndex];

  await randomProduct?.click();

  await page.waitForNavigation();

  await getProductDescription(page, browser);
};

export default selectAndOpenDepartament;
