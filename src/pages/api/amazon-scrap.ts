import { type NextApiRequest, type NextApiResponse } from "next";
import puppeteer from "puppeteer";

interface Review {
  rating: string;
  description: string;
}

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

const pageLink = getPositiveOnlyReviewsURL(
  clearAmazonURL(
    "https://www.amazon.com/Biotin-Anti-Hair-Loss-Shampoo/dp/B07K4S4J66/ref=cm_cr_arp_d_product_top?ie=UTF8"
  )
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    devtools: true,
  });

  const page = await browser.newPage();

  await page.goto(pageLink);

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

  // await browser.close();

  return res.status(200).json({ reviews });
}
