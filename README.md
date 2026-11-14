# Abandoned but Not Forgotten

A bilingual (EN/ES) pixel-art digital library of spacecraft left behind on the Moon and Mars,
made for teenagers (13–18) and classrooms. NASA Space Apps Challenge project.

Plain HTML, CSS and JavaScript. No build step.

## Run it

Open `index.html` in a browser, or serve the folder (needed for the narration check to work everywhere):

```
python -m http.server 8000
```

On GitHub Pages: push the repo, then Settings → Pages → deploy from the main branch, root folder.

## Where things live

| File | What's in it |
| --- | --- |
| `index.html` | Page shell: sky, top bar, language toggle |
| `css/style.css` | All styles |
| `js/app.js` | Router, language switch, library, reader, coloring page, quiz |
| `data/books.js` | **All text**: UI strings, book pages, quiz questions, pixel art, map sites (EN + ES) |
| `audio/` | Narration files, see `audio/README.md` |

To add a Spanish translation, fill the empty `es: ''` fields in `data/books.js`.
Until then the site shows the English text with a small "translation coming soon" note.
