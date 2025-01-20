/**
 * script.js
 *
 * - Fetch all pages from the Notion DB
 * - For each page, gather up to 5 color properties (if present)
 * - Construct a palette URL with those color codes
 * - Update the page cover in Notion
 */
require("dotenv").config(); // loads .env for local testing
const { Client } = require("@notionhq/client");

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.DATABASE_ID;
const BASE_VERCEL_URL = process.env.BASE_VERCEL_URL || "http://localhost:3000";

// The route to our palette function
const PALETTE_ENDPOINT = `${BASE_VERCEL_URL}/api/palette`;

// Initialize Notion
const notion = new Client({ auth: NOTION_TOKEN });

async function updatePaletteCovers() {
    // 1) Get all pages from the DB
    const { results } = await notion.databases.query({
        database_id: DATABASE_ID,
    });

    // 2) For each page, read up to 5 color properties
    for (const page of results) {
        const pageId = page.id;
        const props = page.properties;

        // Gather color values in an array.
        // We'll assume they're named "Color 1"..."Color 5".
        // If a property is empty, we skip it.
        const colorProps = ["Color 1", "Color 2", "Color 3", "Color 4", "Color 5"];
        const colorValues = colorProps
            .map((propName) => getTextValue(props[propName]))
            .filter((val) => !!val); // keep only non-empty

        // If no colors, we can decide to skip or default them
        // We'll just default to #FFFFFF if empty
        if (colorValues.length === 0) {
            colorValues.push("#FFFFFF");
        }

        // 3) Construct the palette URL. We'll do ?c1=...&c2=... up to c5
        const querySegments = colorValues
            .map((col, idx) => `c${idx+1}=${encodeURIComponent(col)}`)
            .join("&");
        // Example: "c1=%23FF0000&c2=%2300FF00&c3=%230000FF"

        const paletteUrl = `${PALETTE_ENDPOINT}?${querySegments}`;

        // 4) Update Notion page cover
        try {
            await notion.pages.update({
                page_id: pageId,
                cover: {
                    type: "external",
                    external: {
                        url: paletteUrl,
                    },
                },
            });
            console.log(`Updated cover for page ${pageId} => ${paletteUrl}`);
        } catch (err) {
            console.error(`Failed updating page ${pageId}`, err);
        }
    }
}

function getTextValue(property) {
    if (!property) return null;
    // If property is a "rich_text" or "title"
    const val = property.rich_text || property.title;
    if (Array.isArray(val) && val[0]?.plain_text) {
        return val[0].plain_text;
    }
    return null;
}

// If you want to run this script directly via "node script.js":
if (require.main === module) {
    updatePaletteCovers()
        .then(() => console.log("All covers updated."))
        .catch(console.error);
}

module.exports = { updatePaletteCovers };
