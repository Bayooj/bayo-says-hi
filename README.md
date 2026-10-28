# Bayo Says Hi: portfolio site

A paper-collage video portfolio. Plain HTML, CSS and JavaScript, so there is no build step and you don't need Node to run or publish it.

## What's in the folder

| Path | What it is |
| --- | --- |
| `index.html` | Page structure (work, services, pricing, about / contact) |
| `css/style.css` | The whole look: paper, tape, stamps, frames, player |
| `js/data.js` | **All the content. This is the file you edit.** |
| `js/main.js` | Routing, the board, the video player, the form, animations |
| `assets/videos/` | Sample clips (placeholders, replace with your films) |
| `assets/stills/` | Pictures shown inside the frames on the board |
| `assets/images/` | Portrait placeholder, favicon, social share image |

## Updating the content (`js/data.js`)

- **Contact:** set `email`, add your profile links under `socials` (links with an empty `url` stay hidden).
- **Films:** each entry in `PROJECTS` becomes a picture on the board. Clicking it plays the first item in `videos`.
  - Your own file: `{ type: "file", src: "assets/videos/my-film.mp4" }`
  - YouTube: `{ type: "youtube", id: "VIDEO_ID" }` (the part after `v=` in the link)
  - Vimeo: `{ type: "vimeo", id: "123456789" }`
  - Add more objects to `videos` (teaser, BTS, vertical cut) and they show up as "more cuts" in the player.
  - `frame` picks the picture style: `magazine`, `strip`, `clipping`, `filmstrip`, `instax` (for 9:16), `print`, `polaroid`.
  - `stills` are the pictures in the frame. Strip and filmstrip frames use three. Add `t` (seconds) to let viewers jump to that moment.
  - Delete `sample: true` once the real film is in. When no film is marked as a sample, the "sample footage" notes disappear.
  - Optional `preview`: a short, small, muted MP4 that plays when someone hovers the picture (useful for YouTube/Vimeo films).
- **Prices:** in `PRICING`, set `price: "800"` to show "from $800". Empty prices show a blank line.
- **Portrait:** replace `assets/images/portrait-placeholder.jpg` with a 4:5 photo of you (keep the name, or change the `src` in `index.html`) and update its `alt` text.

### Video tips

- Export H.264 MP4 at 1080p. Keep files small: GitHub blocks files over 100 MB, and a Pages site should stay under about 1 GB in total.
- For long films, host them on YouTube or Vimeo and use the `youtube` / `vimeo` types instead.
- Make the stills the same shape as the frame (16:9 for most, 9:16 for vertical reels).

## The contact form

By default the form opens the visitor's email app with their message filled in. To receive messages without that step, create a free form on a service like Formspree and paste its endpoint into `formEndpoint` in `js/data.js`.

## Publish on GitHub Pages (free)

1. Create a GitHub repository and upload everything in this folder, with `index.html` at the top level.
2. In the repository: **Settings → Pages → Build and deployment → Deploy from a branch**, choose `main` and `/ (root)`.
3. In **Settings → Pages → Custom domain**, enter your domain and save. Tick **Enforce HTTPS** when it becomes available.
4. At Namecheap: **Domain List → Manage → Advanced DNS**. Remove the parking records, then add:

   | Type | Host | Value |
   | --- | --- | --- |
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | `your-github-username.github.io` |

   DNS changes can take a few hours to show up. Adding the `www` record means both `yourdomain.com` and `www.yourdomain.com` work.

## Or publish on Vercel

Import the folder as a project (framework: Other, no build command), then add your domain under **Project → Settings → Domains** and copy the A and CNAME values Vercel shows there into Namecheap's Advanced DNS.

## Preview on your computer

Open a terminal in this folder and run `python3 -m http.server 8000`, then visit http://localhost:8000.
