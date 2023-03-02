import { type Page, type Browser, type ElementHandle } from "puppeteer";
import getProductDescription from "./getProductDescription";

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

  console.log(1111111);

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

  await page.evaluate(() => {
    const MINIMUM_AMOUNT_OF_REVIEWS = 10.0;
    const productsWithEnoughReviews: Element[] = [];

    document.querySelectorAll("#gridItemRoot").forEach((review) => {
      const amountOfReviews = Number(
        review
          .querySelector(".a-row .a-size-small")
          ?.textContent?.replace(",", "")
      );

      if (amountOfReviews >= MINIMUM_AMOUNT_OF_REVIEWS) {
        productsWithEnoughReviews.push(review);
      }
    });

    const randomProductIndex = Math.floor(
      Math.random() * productsWithEnoughReviews.length
    );

    const randomProduct = productsWithEnoughReviews[randomProductIndex];

    randomProduct?.querySelector("a")?.click();
  });

  await page.waitForNavigation();

  await getProductDescription(page, browser);
};

export default selectAndOpenDepartament;
