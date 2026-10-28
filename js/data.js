/* ==========================================================================
   BAYO SAYS HI — SITE CONTENT
   This is the only file you need to edit to update the site.
   Everything on the page (films, services, prices, contact) is built from it.
   ========================================================================== */

/* ---- Contact + links ---------------------------------------------------- */
window.SITE = {
  name: "Bayo Says Hi",
  person: "Adebayo Ojo",
  role: "Videographer & editor",
  location: "Vancouver, BC",

  // The address shown on the contact page and used by the booking form.
  email: "hello@yourdomain.com",

  // Optional. Paste a Formspree (or similar) endpoint to receive form messages
  // directly, e.g. "https://formspree.io/f/abcdwxyz". Leave empty and the form
  // opens the visitor's email app with their message filled in instead.
  formEndpoint: "",

  // Leave url empty to hide a link. Add your profile URLs when ready.
  socials: [
    { label: "Instagram", url: "" },
    { label: "YouTube", url: "" },
    { label: "Vimeo", url: "" }
  ]
};

/* ---- Films --------------------------------------------------------------
   One entry per project. The first video in `videos` plays when someone
   clicks the picture. Extra videos show up as "more cuts" in the player.

   video types:
     { type: "file",    src: "assets/videos/my-film.mp4" }   your own MP4
     { type: "youtube", id: "dQw4w9WgXcQ" }                 YouTube video id
     { type: "vimeo",   id: "76979871" }                    Vimeo video id

   frame (how the picture is presented on the board):
     "magazine" | "strip" | "clipping" | "filmstrip" | "instax" | "print" | "polaroid"

   stills: pictures used inside the frame. Add `t` (seconds) to let viewers
   jump to that moment from the player (works for MP4 files).

   sample: true shows a small "sample footage" note. Delete it once the
   real film is in.
   ------------------------------------------------------------------------ */
window.PROJECTS = [
  {
    id: "after-hours",
    title: "After Hours",
    category: "Brand films",
    year: "2026",
    role: "Director, DP, editor",
    format: "16:9",
    frame: "magazine",
    stills: [
      { src: "assets/stills/after-hours-1.jpg", t: 0.9 },
      { src: "assets/stills/after-hours-2.jpg", t: 2.6 },
      { src: "assets/stills/after-hours-3.jpg", t: 4.4 }
    ],
    videos: [{ label: "Film", type: "file", src: "assets/videos/after-hours.mp4" }],
    notes: "A night-time brand film set in the city after closing, built on a slow focus pull through the street lights.",
    sample: true
  },
  {
    id: "night-signals",
    title: "Night Signals",
    category: "Music videos",
    year: "2026",
    role: "DP, editor",
    format: "16:9",
    frame: "strip",
    stills: [
      { src: "assets/stills/night-signals-1.jpg", t: 1.3 },
      { src: "assets/stills/night-signals-2.jpg", t: 2.9 },
      { src: "assets/stills/night-signals-3.jpg", t: 4.7 }
    ],
    videos: [{ label: "Music video", type: "file", src: "assets/videos/night-signals.mp4" }],
    notes: "A live performance video lit with moving heads and haze, cut on the beat.",
    sample: true
  },
  {
    id: "matchday",
    title: "Matchday",
    category: "Short films",
    year: "2026",
    role: "Writer, director, editor",
    format: "16:9",
    frame: "clipping",
    kicker: "Sport · Visual essay",
    stills: [
      { src: "assets/stills/matchday-2.jpg", t: 3.0 },
      { src: "assets/stills/matchday-1.jpg", t: 1.2 },
      { src: "assets/stills/matchday-3.jpg", t: 4.8 }
    ],
    videos: [{ label: "Visual essay", type: "file", src: "assets/videos/matchday.mp4" }],
    notes: "A football visual essay about community and the people who keep showing up for each other on matchday, told in voice-over.",
    sample: true
  },
  {
    id: "creators-curse",
    title: "Creator's Curse",
    category: "Short films",
    year: "2026",
    role: "Writer, director",
    status: "In development",
    format: "16:9",
    frame: "filmstrip",
    stamp: "In development",
    stills: [
      { src: "assets/stills/creators-curse-1.jpg", t: 0.45 },
      { src: "assets/stills/creators-curse-2.jpg", t: 2.45 },
      { src: "assets/stills/creators-curse-3.jpg", t: 4.45 }
    ],
    videos: [{ label: "Leader", type: "file", src: "assets/videos/creators-curse.mp4" }],
    notes: "A five-minute short about a filmmaker who keeps putting off his own film. Script and storyboard in progress.",
    sample: true
  },
  {
    id: "afroween",
    title: "AFROWEEN",
    category: "Events",
    year: "2026",
    role: "Shot & edited",
    format: "9:16",
    frame: "instax",
    stills: [
      { src: "assets/stills/afroween-1.jpg", t: 1.1 },
      { src: "assets/stills/afroween-2.jpg", t: 2.6 },
      { src: "assets/stills/afroween-3.jpg", t: 4.3 }
    ],
    videos: [{ label: "Recap reel", type: "file", src: "assets/videos/afroween.mp4" }],
    notes: "A 60-second vertical recap of the night, cut in DaVinci Resolve for Instagram.",
    sample: true
  },
  {
    id: "studio-session",
    title: "Studio Session",
    category: "Brand films",
    year: "2026",
    role: "DP, colourist",
    format: "16:9",
    frame: "print",
    stills: [
      { src: "assets/stills/studio-session-2.jpg", t: 3.0 },
      { src: "assets/stills/studio-session-1.jpg", t: 1.5 },
      { src: "assets/stills/studio-session-3.jpg", t: 4.6 }
    ],
    videos: [{ label: "Product film", type: "file", src: "assets/videos/studio-session.mp4" }],
    notes: "A product film for a small-batch brand: one bottle, one moving key light and a glossy floor.",
    sample: true
  },
  {
    id: "north-shore",
    title: "North Shore",
    category: "Travel",
    year: "2026",
    role: "Shot & edited",
    format: "16:9",
    frame: "polaroid",
    stills: [
      { src: "assets/stills/north-shore-2.jpg", t: 3.1 },
      { src: "assets/stills/north-shore-1.jpg", t: 1.4 },
      { src: "assets/stills/north-shore-3.jpg", t: 4.9 }
    ],
    videos: [{ label: "B-roll film", type: "file", src: "assets/videos/north-shore.mp4" }],
    notes: "Sunrise over the mountains above the water. A short travel piece made from one early morning.",
    sample: true
  },
  {
    id: "rain-check",
    title: "Rain Check",
    category: "Short films",
    year: "2026",
    role: "Director, editor",
    format: "16:9",
    frame: "print",
    stills: [
      { src: "assets/stills/rain-check-1.jpg", t: 1.2 },
      { src: "assets/stills/rain-check-2.jpg", t: 2.8 },
      { src: "assets/stills/rain-check-3.jpg", t: 4.5 }
    ],
    videos: [{ label: "Short doc", type: "file", src: "assets/videos/rain-check.mp4" }],
    notes: "A short documentary piece filmed through a rain-covered window on a long Vancouver evening.",
    sample: true
  }
];

/* ---- Services page ------------------------------------------------------ */
window.SERVICES = [
  { title: "Music videos", text: "Performance, narrative and visualizers. I help shape the idea, light the room and cut to the beat." },
  { title: "Brand films", text: "Short films about products, places and the people behind them, with cutdowns for every platform." },
  { title: "Event recaps", text: "Parties, launches and conferences. You get a recap film plus vertical edits while people are still talking about the night." },
  { title: "Short films & docs", text: "From script and shot list to final grade, for your story or for mine." },
  { title: "Editing & colour", text: "Already shot it? Send the footage. I edit and grade in DaVinci Resolve Studio." },
  { title: "Social content", text: "Vertical edits built for Reels, TikTok and Shorts, with captions and covers." }
];

window.PROCESS = [
  { title: "First call", text: "We talk through the idea, who it's for, the date and the budget. Then I send a written quote." },
  { title: "Pre-production", text: "Treatment, locations and a shot list, so everyone arrives on shoot day knowing the plan." },
  { title: "Shoot day", text: "I film on a Sony FX30 with a small, quick setup that keeps the crew light and the energy up." },
  { title: "Edit & delivery", text: "I edit and colour, you review a first cut, and I deliver final files sized for everywhere they'll be posted." }
];

/* ---- Pricing page ---------------------------------------------------------
   price: write it the way you want it shown, e.g. "800" (shows "from $800").
   Leave empty to show a blank line.
   ------------------------------------------------------------------------ */
window.PRICING = [
  {
    group: "For artists & creators",
    packages: [
      { name: "Music video", price: "", blurb: "For a single release.", items: ["Concept & shot list", "1 shoot day", "Edit & colour grade", "3 vertical cutdowns"] },
      { name: "Live session", price: "", blurb: "One room, filmed properly.", items: ["Single location", "Up to 3 songs", "Edit & colour grade", "Synced to your audio"] },
      { name: "Content day", price: "", blurb: "Stock up for the month.", items: ["Half-day shoot", "5 vertical edits", "Captions & covers", "1 round of changes"] }
    ]
  },
  {
    group: "For brands & events",
    packages: [
      { name: "Brand film", price: "", blurb: "Your story in 60 to 90 seconds.", items: ["Creative treatment", "1 shoot day", "60–90 sec film", "3 social cutdowns"] },
      { name: "Event recap", price: "", blurb: "The night, on film.", items: ["Up to 4 hours coverage", "60–90 sec recap film", "1 vertical recap reel", "Delivery date set up front"] },
      { name: "Social package", price: "", blurb: "Short-form, every month.", items: ["1 shoot per month", "8 vertical edits", "Captions & covers", "Monthly check-in"] }
    ]
  }
];
