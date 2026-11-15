# Abandoned but Not Forgotten: Digital Library

Digital library about the spacecraft abandoned on the Moon and Mars.

A bilingual (English / Spanish) pixel-art digital library for teenagers (13–18) and classrooms,
made for the **NASA Space Apps Challenge**.

**Live site:** https://cammiiic.github.io/Abandoned-but-Not-Forgotten-Digital-Library/

## What's inside

- **Library:** four illustrated books: Apollo 11 (Eagle), GRAIL (Ebb and Flow), Viking 1 and Opportunity.
- **Book reader:** pages turn like a real book (two-page spreads on wide screens, one page on phones; drag, swipe, arrow keys or buttons).
- **Audiobook:** every page narrated in English and Spanish by Camila, with auto page-turn, speed control and lock-screen controls on phones.
- **Color by number:** a 64×64 coloring page made from each spacecraft's pixel art (pinch, scroll or drag to zoom and move).
- **Quiz:** 5 random questions per book from a pool of 10, with shuffled answers, a 0–100% score at the end and your best score saved per book.
- **Ambient sound:** a soft space soundtrack made live in the browser, with a speaker button to mute it. It fades out while the audiobook plays.
- **Where are they now?** Each spacecraft on its mission vs. today, abandoned, with a timeline.
- **Graveyard map:** pixel maps of the Moon and Mars with each spacecraft's resting place.
- **Our mission:** project goal, NASA sources, team and how we used AI.

## Team

Camila and Alejandra.

## Run it locally

No build step: plain HTML, CSS and JavaScript. Open `index.html` in a browser, or serve the folder
with any static web server.

## Where things live

| File | What's in it |
| --- | --- |
| `index.html` | Page shell: sky, top bar, language toggle |
| `css/style.css` | All styles |
| `js/app.js` | Router, language switch, library, reader, audiobook, coloring page, quiz, timelines, map |
| `js/sprites.js` | Pixel art drawn in code (spacecraft, Sun/Moon/Mars, maps) |
| `data/books.js` | **All text**: UI strings, stories, quizzes, timelines, map sites, mission page (EN + ES) |
| `audio/` | Narration files: `{book}-p{1-5}-{en|es}.m4a` |

## License

Apache License 2.0, see [LICENSE](LICENSE).
