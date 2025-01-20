module.exports = async (req, res) => {
    // 1) Gather up to 5 colors
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

    // 2) Smaller height so Notion doesn't crop too much
    const width = 600;
    const height = 300;
    const columnWidth = width / colors.length;

    let rects = "";
    let labels = "";

    // Simple brightness check for black/white text
    function getContrastingTextColor(hex) {
        const cleanHex = hex.replace(/^#/, "");
        const r = parseInt(cleanHex.slice(0, 2), 16);
        const g = parseInt(cleanHex.slice(2, 4), 16);
        const b = parseInt(cleanHex.slice(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 155 ? "#000000" : "#FFFFFF";
    }

    colors.forEach((col, idx) => {
        const x = idx * columnWidth;

        // Stripe rectangle
        rects += `
      <rect
        x="${x}"
        y="0"
        width="${columnWidth}"
        height="${height}"
        fill="${col}"
      />
    `;

        // Label text in the vertical center
        const textX = x + columnWidth / 2;
        const textY = height / 2; // center
        const textColor = getContrastingTextColor(col);
        const displayedCode = col.replace(/^#/, ""); // remove "#"

        labels += `
      <text
        x="${textX}"
        y="${textY}"
        fill="${textColor}"
        font-size="16"
        text-anchor="middle"
        alignment-baseline="middle"
        font-family="sans-serif"
      >
        ${displayedCode}
      </text>
    `;
    });

    // Combine rects + labels
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

    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);
};
