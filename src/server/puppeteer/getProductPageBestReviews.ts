import { type Browser, type Page } from "puppeteer";
import selectAndOpenDepartament from "./selectAndOpenDepartament";

const clearAmazonURL = (string: string) =>
  string
    .split("/")
    .reduce((acc, current, index) => {
      if (index < 6) {
        return acc + current + "/";
      }

      return acc;
    })
    .replace(/\/$/, "");

const getPositiveOnlyReviewsURL = (string: string) =>
  string
    .replace("dp", "product-reviews")
    .concat(
      "/ref=cm_cr_getr_d_paging_btm_prev_1?ie=UTF8&reviewerType=all_reviews&filterByStar=positive&pageNumber=1"
    );

interface Review {
  rating: string;
  description: string;
}

const getProductPageBestReviews = async (page: Page, browser: Browser) => {
  await page.goto(getPositiveOnlyReviewsURL(clearAmazonURL(page.url())));

  const reviews = await page.evaluate(() => {
    const pageReviews: Review[] = [];

    document
      .querySelectorAll(".a-section.review.aok-relative")
      .forEach((review) => {
        const rating = review.querySelectorAll(".a-link-normal")[0]
          ?.textContent as string;
        const description = review.querySelector<HTMLElement>(
          ".review-data.a-spacing-small"
        )?.innerText as string;

        pageReviews.push({ rating, description });
      });

    return pageReviews;
  });

  await selectAndOpenDepartament(browser, page);
};

export default getProductPageBestReviews;
