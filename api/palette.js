module.exports = async (req, res) => {
    // 1) Gather up to 5 colors from the query
    const colors = [];
    for (let i = 1; i <= 5; i++) {
        const colorParam = req.query[`c${i}`];
        if (colorParam) {
            colors.push(colorParam);
        }
    }
    if (colors.length === 0) {
        colors.push("#FFFFFF");
    }

    // 2) Basic dimensions for a tall, vertical palette
    const width = 600;
    const height = 900;
    const columnWidth = width / colors.length;

    // 3) We'll build two strings: one for <rect> stripes, one for <text> labels
    let rects = "";
    let labels = "";

    // Function to decide black/white text
    function getContrastingTextColor(hex) {
        const cleanHex = hex.replace(/^#/, "");
        const r = parseInt(cleanHex.slice(0, 2), 16);
        const g = parseInt(cleanHex.slice(2, 4), 16);
        const b = parseInt(cleanHex.slice(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 155 ? "#000000" : "#FFFFFF";
    }

    colors.forEach((col, index) => {
        const x = index * columnWidth;

        // Draw the stripe
        rects += `
    <rect
      x="${x}"
      y="0"
      width="${columnWidth}"
      height="${height}"
      fill="${col}"
    />
  `;

        // Decide text color via brightness
        const textColor = getContrastingTextColor(col);
        // Remove the "#" in display
        const displayedCode = col.replace(/^#/, "");

        // Position the text near the bottom center
        const textX = x + columnWidth / 2;
        const textY = height - 20; // 20px from the bottom

        labels += `
    <text
      x="${textX}"
      y="${textY}"
      fill="${textColor}"
      font-size="16"
      text-anchor="middle"
      alignment-baseline="baseline"
      font-family="sans-serif"
    >
      ${displayedCode}
    </text>
  `;
    });


    // 4) Combine rectangles + labels into final SVG
    const svg = `
<svg 
  xmlns="http://www.w3.org/2000/svg"
  width="${width}"
  height="${height}"
>
  ${rects}
  ${labels}
</svg>
`;

    // 5) Return the SVG
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);
};
