# Optimized Haesol stickers

Generated from `design/해솔/해솔 svg` by `scripts/optimize-haesol.py`.
Original exports are retained. Embedded PNGs are cropped to the inverse-transformed
pattern viewport with a four-pixel margin and encoded losslessly. There is no
resizing or palette reduction. SVG dimensions, pattern transforms and image pixel
coordinates are preserved.

To regenerate with Python and Pillow installed:

```sh
python scripts/optimize-haesol.py
npm run build
```

The generator supports the current single-image, single-use Figma exports.
Review changed exports visually, especially rotated patterns, before shipping.
`manifest.json` records source and output SHA-256 hashes. `copy-assets.cjs` uses
the optimized file only when both hashes match, otherwise it copies the original.
Python and Pillow are needed only to regenerate these checked-in files, not to
build or run the app.

Validation: 35 stickers rendered at 96, 192 and 384 pixels (105 comparisons).
The largest mean absolute channel difference was 0.084 on a 0–255 scale; rendering
is not byte-identical because sampling can differ after cropping. Representative
rotated and non-rotated comparisons were also visually reviewed.
