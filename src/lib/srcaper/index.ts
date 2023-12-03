"use server";

import axios, { Axios } from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractDescription, extractPrice } from "../utils";

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;

  // BrightData proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false,
  };

  try {
    // Fetch the product page
    const response = await axios.get(url, options);

    const data = amazon(url, response);

    return data;
  } catch (error: any) {
    console.log(error);
  }
}

const amazon = (url: string, response: any) => {
  const $ = cheerio.load(response.data);

  // Extract the product title
  const title = $("#productTitle").text().trim();
  const currentPrice = extractPrice(
    $(".priceToPay span.a-price-whole"),
    $(".a.size.base.a-color-price"),
    $(".a-button-selected .a-color-base")
  );

  const originalPrice = extractPrice(
    $("#priceblock_ourprice"),
    $(".a-price.a-text-price span.a-offscreen"),
    $("#listPrice"),
    $("#priceblock_dealprice"),
    $(".a-size-base.a-color-price")
  );

  const outOfStock =
    $("#availability span").text().trim().toLowerCase() ===
    "currently unavailable";

  const images =
    $("#imgBlkFront").attr("data-a-dynamic-image") ||
    $("#landingImage").attr("data-a-dynamic-image") ||
    "{}";

  const imageUrls = Object.keys(JSON.parse(images));

  const currency = extractCurrency($(".a-price-symbol"));
  const discountRate = $(".savingsPercentage").text().replace(/[-%]/g, "");

  const description = extractDescription($);

  // Construct data object with scraped information
  const data = {
    url,
    currency: currency || "$",
    image: imageUrls[0],
    title,
    currentPrice: Number(currentPrice) || Number(originalPrice),
    originalPrice: Number(originalPrice) || Number(currentPrice),
    priceHistory: [],
    discountRate: Number(discountRate),
    category: "category",
    reviewsCount: 100,
    stars: 4.5,
    isOutOfStock: outOfStock,
    description,
    lowestPrice: Number(currentPrice) || Number(originalPrice),
    highestPrice: Number(originalPrice) || Number(currentPrice),
    averagePrice: Number(currentPrice) || Number(originalPrice),
  };
  return data;
};
const flipkart = async (url: string) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $("._35KyD6").text().trim();
    const currentPrice = $("._1vC4OE._3qQ9m1").text().trim();
    const originalPrice = $("._3auQ3N._1POkHg").text().trim();
    const discountRate = $(".VGWI6T span").text().trim();
    const category = $("._1KHd47").text().trim();
    const reviewsCount = $(".row ._38sUEc span span:nth-child(1)")
      .text()
      .trim();
    const stars = $(".row ._38sUEc span span:nth-child(2)").text().trim();
    const isOutOfStock =
      $(".row ._9-sL7L").text().trim() === "Currently unavailable";
    const description = $("._1y9a40:nth-child(2)").text().trim();
    const imageUrls: any[] = [];
    $("._1Nyybr").each((i, elem) => {
      imageUrls.push($(elem).attr("src"));
    });

    const data = {
      url,
      currency: "₹",
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice.replace(/[^0-9.-]+/g, "")),
      originalPrice: Number(originalPrice.replace(/[^0-9.-]+/g, "")),
      priceHistory: [],
      discountRate: Number(discountRate.replace(/[^0-9.-]+/g, "")),
      category,
      reviewsCount: Number(reviewsCount.replace(/[^0-9.-]+/g, "")),
      stars: Number(stars.replace(/[^0-9.-]+/g, "")),
      isOutOfStock,
      description,
      lowestPrice: Number(currentPrice.replace(/[^0-9.-]+/g, "")),
      highestPrice: Number(originalPrice.replace(/[^0-9.-]+/g, "")),
      averagePrice: Number(currentPrice.replace(/[^0-9.-]+/g, "")),
    };

    return data;
  } catch (error) {
    console.error(error);
  }
};
