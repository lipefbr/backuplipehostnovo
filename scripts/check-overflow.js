// Browser script to check horizontal overflow at various scroll positions
(async () => {
  const heights = [0, 800, 1600, 2400, 3200, 4000, 5000, 6000, 7000, 8000, 9000];
  const results = [];
  for (const h of heights) {
    window.scrollTo(0, h);
    await new Promise(r => setTimeout(r, 300));
    const sw = document.documentElement.scrollWidth;
    const iw = window.innerWidth;
    results.push({ height: h, scrollWidth: sw, innerWidth: iw, overflow: sw - iw });
  }
  console.log(JSON.stringify(results, null, 2));
  window.scrollTo(0, 0);
  return results;
})();
