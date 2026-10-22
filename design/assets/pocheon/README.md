# Pocheon menu artwork

Generated with the built-in image_gen tool from the user-supplied Pocheon photo frame.
The main menu uses menu-button.png at 437 × 316 CSS pixels. The entry opens two
frame choices, followed by print quantity, six captures and four distinct selections.
frame-1.png and frame-2.png preserve the user-supplied originals. Photos are drawn
over rounded openings using shared coordinates in src/shared/pocheonFrames.ts,
so residual alpha in the supplied openings does not obscure the captured photos.
The example PNGs appear only on the frame selection cards.
Print composition is 1200 × 1800 pixels through the existing Supabase print queue.
Homecoming components and print assets remain available in source.

Generation prompt:

Create a polished horizontal menu tile artwork based on this photo frame, target aspect ratio 437:316. Use the same cream background, pastel pink and mint wavy edges, sparse little yellow hearts, flowers and clovers. Preserve the two mascot identities faithfully: pink hood girl with round glasses and lightning ornament, mint hood boy with yellow heart ornament, black hair, rosy cheeks, finger-heart poses. Place both mascots together in bottom right, fully contained. Main focal title on upper/center left must read EXACTLY '포천네것' (포 천 네 것, NOT 컷), bold charcoal lettering inspired by reference, with cyan hash and orange asterisk. Balanced uncluttered legible menu card at small size. NO photo windows, NO black areas or speckled artifacts from reference, NO additional text. Flat front-facing artwork, fills entire rectangular canvas, no outer mockup, no shadow outside. This is a menu button illustration, not the entire portrait photo frame.
