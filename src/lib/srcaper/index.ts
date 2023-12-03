"use server";

import axios, { Axios } from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractDescription, extractPrice } from "../utils";

export async function scrapeProduct(url: string) {
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
    if (url.includes("amazon")) {
      const data = amazon(url, response);
      return data;
    }
    if (url.includes("myntra")) {
      const data = myntra(url);
      return data;
    }
    if (url.includes("indiamart")) {
      const data = indiaMART(url);
      return data;
    }
    if (url.includes("shopify")) {
      const data = shopify(url);
      return data;
    }
    if (url.includes("bookmyshow")) {
      const data = bookMyShow(url);
      return data;
    }
    if (url.includes("nykaa")) {
      const data = nykaa(url);
      return data;
    }
    if (url.includes("firstcry")) {
      const data = firstCry(url);
      return data;
    }
    if (url.includes("1mg")) {
      const data = oneMg(url);
      return data;
    }
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

const myntra = async (url: string) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $(".pdp-title").text().trim();
    const currentPrice = $(".pdp-price").text().trim();
    const originalPrice = $(".pdp-mrp").text().trim();
    const discountRate = $(".pdp-discount").text().trim();
    const category = $(".breadcrumbs-container a").last().text().trim();
    const reviewsCount = $(".rating-count").text().trim();
    const stars = $(".rating-value").text().trim();
    const isOutOfStock = $(".size-buttons-unified-size").length === 0;
    const description = $(".pdp-product-description").text().trim();
    const imageUrls: string[] = [];
    $(".image-grid-image").each((i, elem) => {
      imageUrls.push(
        $(elem)?.attr("style")?.match(`/url\("(.*)"\)/`)?.[0] ?? ""
      );
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
const shopify = async (url: string) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $(".product-single__title").text().trim();
    const currentPrice = $(".product__price").text().trim();
    const originalPrice = $(".product__price--compare-at").text().trim();
    const discountRate = $(".product__price--compare-at").text()
      ? Math.round(
          (1 -
            Number(currentPrice.replace(/[^0-9.-]+/g, "")) /
              Number(originalPrice.replace(/[^0-9.-]+/g, ""))) *
            100
        )
      : 0;
    const category = $(".breadcrumb-item a").last().text().trim();
    const reviewsCount = $(".spr-badge-caption").text().trim();
    const stars = $(".spr-badge").attr("data-rating");
    const isOutOfStock =
      $(".product-form__item--submit .btn").text().trim() === "Sold Out";
    const description = $(".rte").text().trim();
    const imageUrls: any[] = [];
    $(".product-single__photo").each((i, elem) => {
      imageUrls.push($(elem).attr("src"));
    });

    const data = {
      url,
      currency: "$",
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice.replace(/[^0-9.-]+/g, "")),
      originalPrice: Number(originalPrice.replace(/[^0-9.-]+/g, "")),
      priceHistory: [],
      discountRate,
      category,
      reviewsCount: Number(reviewsCount.replace(/[^0-9.-]+/g, "")),
      stars: Number(stars),
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

const ebay = async (url: string) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $("#itemTitle")
      .text()
      .replace(/Details about  /i, "")
      .trim();
    const currentPrice = $("#prcIsum").attr("content");
    const originalPrice = $(".vi-originalPrice").text().trim();
    const discountRate = $(".vi-originalPrice").text()
      ? Math.round(
          (1 -
            Number(currentPrice) /
              Number(originalPrice.replace(/[^0-9.-]+/g, ""))) *
            100
        )
      : 0;
    const category = $(".bc-w a").last().text().trim();
    const reviewsCount = $("#vi-bybox-stars-on .vi-VR-rvRtgPct").text().trim();
    const stars = $("#vi-bybox-stars-on .vi-VR-rvRtgPct").text().trim();
    const isOutOfStock = $("#qtySubTxt").text().trim() === "Out of stock";
    const description = $("#vi-desc-maincntr .sec").text().trim();
    const imageUrls: any[] = [];
    $("#vi_main_img_fs ul li img").each((i, elem) => {
      imageUrls.push($(elem).attr("src"));
    });

    const data = {
      url,
      currency: "$",
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice),
      originalPrice: Number(originalPrice.replace(/[^0-9.-]+/g, "")),
      priceHistory: [],
      discountRate,
      category,
      reviewsCount: Number(reviewsCount.replace(/[^0-9.-]+/g, "")),
      stars: Number(stars.replace(/[^0-9.-]+/g, "")),
      isOutOfStock,
      description,
      lowestPrice: Number(currentPrice),
      highestPrice: Number(originalPrice.replace(/[^0-9.-]+/g, "")),
      averagePrice: Number(currentPrice),
    };

    return data;
  } catch (error) {
    console.error(error);
  }
};

const indiaMART = async (url: string) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $(".pNAk .lcname").text().trim();
    const currentPrice = $(".prcDsp").text().trim();
    const originalPrice = $(".prcDsp").text().trim(); // IndiaMART does not display original price if discounted
    const discountRate = 0; // IndiaMART does not display discount rate
    const category = $(".br.breadcrumbs a").last().text().trim();
    const reviewsCount = $(".veR > span").text().trim();
    const stars = $(".veR > span").text().trim();
    const isOutOfStock =
      $(".r.c3").text().trim() === "This product is out of stock!";
    const description = $(".desc.itmC").text().trim();
    const imageUrls: any[] = [];
    $(".imgC img").each((i, elem) => {
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
      discountRate,
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

const bookMyShow = async (url: string) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $(".__name").text().trim();
    const currentPrice = $(".__price").text().trim();
    const originalPrice = $(".__price").text().trim(); // Book My Show does not display original price if discounted
    const discountRate = 0; // Book My Show does not display discount rate
    const category = $(".__dimension").text().trim();
    const reviewsCount = $(".__votes").text().trim();
    const stars = $(".__percentage").text().trim();
    const isOutOfStock = $(".__book-button").text().trim() === "SOLD OUT";
    const description = $(".__synopsis").text().trim();
    const imageUrls: any[] = [];
    $(".__poster img").each((i, elem) => {
      imageUrls.push($(elem).attr("data-src"));
    });

    const data = {
      url,
      currency: "₹",
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice.replace(/[^0-9.-]+/g, "")),
      originalPrice: Number(originalPrice.replace(/[^0-9.-]+/g, "")),
      priceHistory: [],
      discountRate,
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

const nykaa = async (url: string) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $(".product-title").text().trim();
    const currentPrice = $(".post-card__content-price-offer").text().trim();
    const originalPrice = $(".post-card__content-price").text().trim();
    const discountRate = $(".post-card__content-price-discount").text().trim();
    const category = $(".breadcrumb-item a").last().text().trim();
    const reviewsCount = $(".ratings__count").text().trim();
    const stars = $(".ratings").attr("data-avg-rating");
    const isOutOfStock =
      $(".add-to-bag-button ").text().trim() === "Out of Stock";
    const description = $("#product-des").text().trim();
    const imageUrls: any[] = [];
    $(".swiper-slide img").each((i, elem) => {
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
      stars: Number(stars),
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

const firstCry = async (url: string) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $(".pdp_title").text().trim();
    const currentPrice = $(".pdpprice").text().trim();
    const originalPrice = $(".mrp").text().trim();
    const discountRate = $(".off").text().trim();
    const category = $(".breadcrumb li").last().text().trim();
    const reviewsCount = $(".ratings .rating").text().trim();
    const stars = $(".ratings .rating").text().trim();
    const isOutOfStock = $(".pdp_soldout").length > 0;
    const description = $("#productDetailTab").text().trim();
    const imageUrls: any[] = [];
    $(".swiper-slide img").each((i, elem) => {
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

const oneMg = async (url: string) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $(".DrugHeader__title___Ybe4H").text().trim();
    const currentPrice = $(".DrugPriceBox__price___dj2lv").text().trim();
    const originalPrice = $(".DrugPriceBox__mrp___2nE8l").text().trim();
    const discountRate = $(".DrugPriceBox__discount___3k5Lw").text().trim();
    const category = $(".BreadCrumbs__breadcrumb___2OHWq a")
      .last()
      .text()
      .trim();
    const reviewsCount = $(".RatingsBox__reviews___1xR1n").text().trim();
    const stars = $(".RatingsBox__ratings___1WZ7W").text().trim();
    const isOutOfStock =
      $(".style__horizontal-box___1df3Z").text().trim() === "Out of Stock";
    const description = $(".DrugOverview__content___22ZBX").text().trim();
    const imageUrls: any[] = [];
    $(".Carousel__image___1Nq6h").each((i, elem) => {
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
