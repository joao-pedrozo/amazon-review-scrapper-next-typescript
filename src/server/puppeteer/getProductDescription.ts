import { type Browser, type Page } from "puppeteer";
import getProductPageBestReviews from "./getProductPageBestReviews";
import selectAndOpenDepartament from "./selectAndOpenDepartament";

const getProductDescription = async (page: Page, browser: Browser) => {
  const aboutThisItemTopics = await page.$$("#feature-bullets li");
  const topics = await Promise.all(
    aboutThisItemTopics.map(async (topic) => {
      const text = await page.evaluate((topic) => topic.textContent, topic);

      return text;
    })
  );

  try {
    const descriptionInnerText = await page.$eval(
      "[data-feature-name=productDescription]",
      (description) => (description as HTMLElement).innerText
    );

    await getProductPageBestReviews(page, browser);
  } catch (err) {
    await selectAndOpenDepartament(browser, page);
  }
};

export default getProductDescription;
