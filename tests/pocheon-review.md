# Pocheon flow review

Open `/tests/pocheon-review.html` on the Vite development server. This review uses
synthetic numbered photographs and the production preview / print compositor; it
does not access a camera, upload images or enqueue print jobs.

Select photos 6, 2, 4, 1, then Next. Both frames must produce 1200 × 1800 PNGs with
that ordering. Pixel checks sample three horizontal positions per slot to detect
frame residue covering the photos. Expected status: PASS for 2 layouts and 8 slots.
Switch the frame dropdown to visually compare preview and exported composition.

The same check also simulates 1920 × 1080, 640 × 480 and 720 × 1280 cameras for
both frame types using the production capture helper. Cyan/yellow edge bands must
survive mirrored capture and placement in all 24 slots without further cropping.

Verified locally: both frame cards open quantity selection, quantity Back returns
to the Pocheon frame choices, Next opens the six-shot guide. Synthetic composition
passed for both frames. Physical camera capture and printer output require device
testing; the existing capture and Supabase queue paths are reused.
