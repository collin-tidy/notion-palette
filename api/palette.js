module.exports = async (req, res) => {
    // Collect up to 5 colors from query params c1..c5
    const colors = [];
    for (let i = 1; i <= 5; i++) {
        const colorParam = req.query[`c${i}`];
        if (colorParam) {
            colors.push(colorParam);
        }
    }

    // If no colors, default to 1 color: white
    if (colors.length === 0) {
        colors.push("#FFFFFF");
    }

    // Let's pick a vertical ratio, e.g. 600 wide, 900 tall
    // (adjust to whatever suits your Notion cover layout)
    const width = 600;
    const height = 900;

    // Each stripe’s width is total width / number of colors
    const columnWidth = width / colors.length;

    // Build <rect> elements for each color
    let rects = "";
    colors.forEach((col, index) => {
        const x = index * columnWidth; // how far from the left we start
        rects += `
      <rect
        x="${x}" 
        y="0" 
        width="${columnWidth}" 
        height="${height}" 
        fill="${col}"
      />
    `;
    });

    // Our final SVG markup
    const svg = `
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="${width}" 
  height="${height}"
>
  ${rects}
</svg>
`;

    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);
};
