# Homecoming mode review

Run `npm run dev` and open `/tests/homecoming-review.html` locally.
This screen uses synthetic numbered images and the production preview/compositor;
it never opens a camera, uploads photos, or submits a print job.

Select any four photos in a nonsequential order, then press 다음. The check renders
all four print layouts and verifies 1200×1800 output, the colors in all 16 photo
slots, and selected order. Download links allow visual review. Select each layout
with the review dropdown to inspect the preview. Selecting a fifth photo must
leave the selection unchanged; removing a selection must renumber later choices.
This test page is not a Vite production build entry.

Design source: Figma `8ZroQdoxLGbSWsH8iqX9fL`.
- Menu: 477:126
- Style / quantity / guide: 477:139, 477:151, 477:173
- Shooting / selection / printing / done: 477:205, 477:210, 477:247, 477:268
- Print layouts 1–4: 481:338, 481:355, 481:344, 481:385

User confirmed six captures and four distinct selections, overriding the old
single-photo text in the Figma selection screen. Photos are rendered beneath the
original transparent 1200×1800 overlays. Preview and print share slot coordinates.
Production printing uses the existing Supabase photos / print_jobs workflow.
Actual camera capture and physical printer output require a device check.
