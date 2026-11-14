/* =====================================================================
   Abandoned but Not Forgotten — all site content lives in this file.

   - ui:      every interface string, in EN and ES
   - books:   the four books (story pages, pixel art, quiz pool, map site)
   - mission: the "Our Mission" page

   Localized fields look like { en: "...", es: "..." }.
   An EMPTY "es" string ("") means "translation pending": the site shows
   the English text plus a small notice until the Spanish is filled in.
   ===================================================================== */

(function () {
  'use strict';

  /* ---------- helpers for placeholder content (replace later) ---------- */

  function placeholderQuiz(name) {
    var out = [];
    for (var i = 1; i <= 10; i++) {
      out.push({
        q: {
          en: 'Placeholder question ' + i + ' about ' + name + '?',
          es: '¿Pregunta de ejemplo ' + i + ' sobre ' + name + '?'
        },
        // answers[correct] is the right one; order is shuffled on screen
        answers: [
          { en: 'Correct answer', es: 'Respuesta correcta' },
          { en: 'Wrong answer A', es: 'Respuesta incorrecta A' },
          { en: 'Wrong answer B', es: 'Respuesta incorrecta B' },
          { en: 'Wrong answer C', es: 'Respuesta incorrecta C' }
        ],
        correct: 0
      });
    }
    return out;
  }

  function placeholderPages() {
    var out = [];
    for (var i = 1; i <= 5; i++) {
      out.push({
        title: { en: 'Part ' + i, es: 'Parte ' + i },
        text: {
          en: 'This story is still being written. Come back soon to read this part of the book.',
          es: 'Esta historia todavía se está escribiendo. Vuelve pronto para leer esta parte del libro.'
        }
      });
    }
    return out;
  }

  /* ---------- UI strings ---------- */

  var ui = {
    en: {
      siteTitle: 'Abandoned but Not Forgotten',
      brand: 'Abandoned but Not Forgotten',
      langLabel: 'Language',
      skip: 'Skip to content',
      navHome: 'Home',
      navLibrary: 'Library',
      navWhere: 'Where now?',
      navMap: 'Map',
      navMission: 'Mission',

      homeKicker: 'NASA Space Apps Challenge',
      homeTitle: 'Abandoned but Not Forgotten',
      homeTagline: 'A pixel-art library of the spacecraft we left behind on the Moon and Mars.',
      homeIntro: 'They flew. They landed. They made history. Then they stayed. Open a book and meet the machines that never came home.',
      homeBtnLibrary: 'Open the library',
      homeBtnWhere: 'Where are they now?',
      homeBtnMap: 'Graveyard map',
      homeBtnMission: 'Our mission',

      libraryTitle: 'The Library',
      libraryIntro: 'Pick a book from the shelf. Each one has a story, a coloring page and a quiz.',
      moon: 'The Moon',
      mars: 'Mars',
      comingSoon: 'Coming soon',

      backToLibrary: 'Library',
      prev: 'Back',
      next: 'Next',
      pageOf: 'Page {n} of {t}',
      readerHint: 'Tip: use the arrow keys or swipe to turn pages.',
      coverKickerMoon: 'Left on the Moon',
      coverKickerMars: 'Left on Mars',
      openBook: 'Open the book',
      part: 'Part {n}',
      listen: 'Listen',
      pause: 'Pause',
      translationPending: 'Spanish translation coming soon. Showing the English text for now.',
      backCover: 'Abandoned, but not forgotten.',
      readAgain: 'Read again',

      activity: 'Activity',
      colorTitle: 'Color by number',
      colorHelp: 'Pick a color, then tap every square with its number.',
      colors: 'Colors',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      squaresLeft: '{n} squares left',
      colorDone: 'You did it! {name} is complete.',
      reset: 'Start over',

      quizTitle: 'Quiz',
      quizHelp: 'Five questions. How much do you remember?',
      questionOf: 'Question {n} of {t}',
      correct: 'Correct!',
      wrong: 'Not quite. The answer was: {a}',
      nextQuestion: 'Next question',
      seeScore: 'See my score',
      score: 'You got {s} out of {t}!',
      scorePerfect: 'Perfect score. Mission control is impressed.',
      scoreGood: 'Nice work, space explorer.',
      scoreTryAgain: 'Read the book again and try new questions.',
      newQuestions: 'New questions',

      whereTitle: 'Where are they now?',
      whereIntro: 'Pick a spacecraft and flip the switch to see it on its mission, and how it looks today.',
      mapTitle: 'Graveyard map',
      mapIntro: 'Find where each spacecraft rests on the Moon and on Mars. All locations are approximate.',
      missionTitle: 'Our mission',
      underConstruction: 'This section is under construction.',

      footer: 'Made for the NASA Space Apps Challenge. Pixel art is illustrative, not to scale.'
    },
    es: {
      siteTitle: 'Abandonados pero no olvidados',
      brand: 'Abandonados pero no olvidados',
      langLabel: 'Idioma',
      skip: 'Saltar al contenido',
      navHome: 'Inicio',
      navLibrary: 'Biblioteca',
      navWhere: '¿Dónde están?',
      navMap: 'Mapa',
      navMission: 'Misión',

      homeKicker: 'NASA Space Apps Challenge',
      homeTitle: 'Abandonados pero no olvidados',
      homeTagline: 'Una biblioteca en pixel art de las naves que dejamos en la Luna y en Marte.',
      homeIntro: 'Volaron. Aterrizaron. Hicieron historia. Y luego se quedaron. Abre un libro y conoce a las máquinas que nunca volvieron a casa.',
      homeBtnLibrary: 'Abrir la biblioteca',
      homeBtnWhere: '¿Dónde están ahora?',
      homeBtnMap: 'Mapa del cementerio',
      homeBtnMission: 'Nuestra misión',

      libraryTitle: 'La Biblioteca',
      libraryIntro: 'Elige un libro del estante. Cada uno tiene una historia, una página para colorear y un cuestionario.',
      moon: 'La Luna',
      mars: 'Marte',
      comingSoon: 'Próximamente',

      backToLibrary: 'Biblioteca',
      prev: 'Atrás',
      next: 'Siguiente',
      pageOf: 'Página {n} de {t}',
      readerHint: 'Consejo: usa las flechas del teclado o desliza para pasar las páginas.',
      coverKickerMoon: 'Dejado en la Luna',
      coverKickerMars: 'Dejado en Marte',
      openBook: 'Abrir el libro',
      part: 'Parte {n}',
      listen: 'Escuchar',
      pause: 'Pausa',
      translationPending: 'La traducción al español llegará pronto. Por ahora se muestra el texto en inglés.',
      backCover: 'Abandonado, pero no olvidado.',
      readAgain: 'Leer de nuevo',

      activity: 'Actividad',
      colorTitle: 'Colorea por números',
      colorHelp: 'Elige un color y toca cada casilla que tenga su número.',
      colors: 'Colores',
      zoomIn: 'Acercar',
      zoomOut: 'Alejar',
      squaresLeft: 'Quedan {n} casillas',
      colorDone: '¡Lo lograste! {name} está completo.',
      reset: 'Empezar de nuevo',

      quizTitle: 'Cuestionario',
      quizHelp: 'Cinco preguntas. ¿Cuánto recuerdas?',
      questionOf: 'Pregunta {n} de {t}',
      correct: '¡Correcto!',
      wrong: 'Casi. La respuesta era: {a}',
      nextQuestion: 'Siguiente pregunta',
      seeScore: 'Ver mi puntuación',
      score: '¡Acertaste {s} de {t}!',
      scorePerfect: 'Puntuación perfecta. Control de misión está impresionado.',
      scoreGood: 'Buen trabajo, explorador espacial.',
      scoreTryAgain: 'Vuelve a leer el libro y prueba con nuevas preguntas.',
      newQuestions: 'Nuevas preguntas',

      whereTitle: '¿Dónde están ahora?',
      whereIntro: 'Elige una nave y mueve el interruptor para verla en su misión y cómo se ve hoy.',
      mapTitle: 'Mapa del cementerio',
      mapIntro: 'Descubre dónde descansa cada nave en la Luna y en Marte. Todas las ubicaciones son aproximadas.',
      missionTitle: 'Nuestra misión',
      underConstruction: 'Esta sección está en construcción.',

      footer: 'Hecho para el NASA Space Apps Challenge. El pixel art es ilustrativo, no está a escala.'
    }
  };

  /* ---------- Books ----------
     art.grid: one string per row, one character per pixel.
     art.palette: character -> { color, name }. Used for the covers AND
     the color-by-number page (the character is the number shown).      */

  var books = [
    {
      id: 'eagle',
      body: 'moon',
      cover: '#2b3f7a',
      title: { en: 'Apollo 11', es: 'Apolo 11' },
      subtitle: { en: 'Eagle, the lunar module', es: 'Eagle, el módulo lunar' },
      craftName: { en: 'Eagle', es: 'Eagle' },
      backText: null, // null = use ui.backCover
      site: {
        name: { en: 'Eagle descent stage, Tranquility Base', es: 'Etapa de descenso del Eagle, Base Tranquilidad' },
        lat: 0.67, lon: 23.47,
        note: { en: 'Ascent stage: location unknown.', es: 'Etapa de ascenso: ubicación desconocida.' }
      },
      pages: [
        {
          title: { en: 'Meet Eagle', es: '' },
          text: {
            en: 'On July 16, 1969, a very big rocket named Saturn V launched from Florida carrying three astronauts: Neil Armstrong, Michael Collins, and Buzz Aldrin. Their mission, Apollo 11, had a goal that no one had ever achieved: to land humans on the Moon and bring them back to Earth safely.\n\n' +
                'They traveled inside a spaceship called Columbia, and attached to it was a smaller, weird-looking vessel called Eagle, the lunar module. Eagle had been built to perform one special job, which was to carry two astronauts from Columbia down to the Moon and then back up. This vessel was never meant to touch Earth\'s sky or return home. It had been made for the Moon.\n\n' +
                'Eagle had two parts stacked on top of each other. The bottom half had four long legs with round feet, almost looking like an insect, and it also carried the tools and science experiments that the astronauts were going to use on the Moon. The top half was the cabin where the astronauts would live and work, and it had its own smaller engine to launch them back into space.\n\n' +
                'The cabin was tiny, about the size of a small closet for two people, and had no seats at all, to save weight. Eagle looked fragile, almost like it was made of foil, but what no one would ever imagine was that a small weird-looking vessel like Eagle was about to make history.',
            es: ''
          }
        },
        {
          title: { en: 'The Landing', es: '' },
          text: {
            en: 'On July 20, 1969, after three days of traveling, the spacecraft finally reached the Moon. Then, Armstrong and Aldrin got into Eagle, and Eagle detached itself from Columbia. Collins stayed in Columbia, orbiting the Moon, while Armstrong and Aldrin flew Eagle down. It took the engine about 12 minutes to slow them down. The landing wasn\'t easy: alarms started going off on Eagle\'s computer because it was overloaded with work. As they got closer to the ground, Armstrong saw that the computer was taking them toward an area full of rocks, so he took control and flew Eagle to a safe spot. They managed to land in a flat, dark area called the Sea of Tranquility. Then, Armstrong sent his famous message back to Earth: "Houston, Tranquility Base here. The Eagle has landed." This meant that for the first time ever, humans had landed in another world.',
            es: ''
          }
        },
        {
          title: { en: 'Footprints', es: '' },
          text: {
            en: 'A few hours later, Armstrong climbed down Eagle\'s ladder, and when he stepped onto the Moon, he said, "That\'s one small step for man, one giant leap for mankind." Aldrin followed him and described the empty landscape as "magnificent desolation." On one of Eagle\'s legs there was a plaque, which read: "We came in peace for all mankind." They spent about two and a half hours outside, and they planted a specially designed flag. It had a horizontal bar along the top that kept the nylon stretched out, so it looked like it was flying. They also talked by phone with the U.S. president Richard Nixon and collected around 22 kilograms of Moon rocks and soil. Before going back inside Eagle, they set up a small science station and left a packet of memorial items on the ground.',
            es: ''
          }
        },
        {
          title: { en: 'Goodbye', es: '' },
          text: {
            en: 'After almost an entire day, it was time for them to leave the Moon. The top half of Eagle launched into space, and the bottom half, which made Eagle look like an insect, remained on the Moon.\n\n' +
                'It\'s still there today, like a launch pad no one will ever use again. Eagle reconnected with Columbia, and Armstrong and Aldrin got back into the big spaceship with Collins. Then they released Eagle into orbit around the Moon, by itself and empty, its mission successfully completed. The three astronauts flew back to Earth as icons, and Eagle? It stayed behind.',
            es: ''
          }
        },
        {
          title: { en: 'Lost, but Not Forgotten', es: '' },
          text: {
            en: 'What happened to Eagle after that? Nobody is one hundred percent sure about this. NASA believed it slowly lost height and crashed somewhere on the Moon after a few months, but no one ever saw it fall, and no one has ever found its crash site. Some researchers have suggested it could still be orbiting the Moon today, though this has not been confirmed. The science station left by Armstrong and Aldrin didn\'t last long either; it ran on sunlight and only worked during the day. On August 27, 1969, it stopped answering and went silent.\n\n' +
                'Not everything was lost, though. The mirror the astronauts left behind needs no power, and scientists still shoot lasers at it. So, Eagle is lost and its science station is quiet, but the story of the weird-looking vessel that carried humans\' first steps on another world will never be forgotten.',
            es: ''
          }
        }
      ],
      art: {
        palette: {
          '1': { color: '#16244a', name: { en: 'Space', es: 'Espacio' } },
          '2': { color: '#ffd23f', name: { en: 'Gold foil', es: 'Lámina dorada' } },
          '3': { color: '#d9822b', name: { en: 'Copper', es: 'Cobre' } },
          '4': { color: '#c7ccd6', name: { en: 'Silver', es: 'Plata' } },
          '5': { color: '#5d6675', name: { en: 'Steel', es: 'Acero' } },
          '6': { color: '#111111', name: { en: 'Window', es: 'Ventana' } },
          '7': { color: '#8f8c86', name: { en: 'Moon dust', es: 'Polvo lunar' } },
          '8': { color: '#ffffff', name: { en: 'Antenna', es: 'Antena' } }
        },
        grid: [
          '1111111111111111',
          '1111111811111111',
          '1111114444411111',
          '1111144444441111',
          '1111446644441111',
          '1111444444444111',
          '1115555555555111',
          '1122222222222211',
          '1123232323232311',
          '1122222222222211',
          '1151111551111511',
          '1511115555111151',
          '1511111111111151',
          '5111111111111115',
          '4411111111111144',
          '7777777777777777'
        ]
      },
      quiz: placeholderQuiz('Apollo 11')
    },

    {
      id: 'grail',
      body: 'moon',
      placeholder: true,
      cover: '#4a3570',
      title: { en: 'GRAIL', es: 'GRAIL' },
      subtitle: { en: 'Ebb and Flow', es: 'Ebb y Flow' },
      craftName: { en: 'Ebb and Flow', es: 'Ebb y Flow' },
      backText: { en: 'Abandoned, but not forgotten.', es: 'Abandonados, pero no olvidados.' },
      site: {
        name: { en: 'GRAIL Ebb & Flow, Sally K. Ride Impact Site', es: 'GRAIL Ebb y Flow, sitio de impacto Sally K. Ride' },
        lat: 75.62, lon: -26.63, note: null
      },
      pages: placeholderPages(),
      art: {
        palette: {
          '1': { color: '#16244a', name: { en: 'Space', es: 'Espacio' } },
          '2': { color: '#ffd23f', name: { en: 'Gold', es: 'Dorado' } },
          '4': { color: '#3a6fd8', name: { en: 'Solar panel', es: 'Panel solar' } },
          '5': { color: '#5d6675', name: { en: 'Steel', es: 'Acero' } },
          '7': { color: '#8f8c86', name: { en: 'Moon dust', es: 'Polvo lunar' } },
          '8': { color: '#ffffff', name: { en: 'Antenna', es: 'Antena' } }
        },
        grid: [
          '1111111111111111',
          '1111111111111111',
          '1111111811111111',
          '1111111511111111',
          '1111122222111111',
          '1444452222254444',
          '1444452222254444',
          '1111122222111111',
          '1111122222111111',
          '1111111511111111',
          '1111111111111111',
          '1111111111111111',
          '1111111111111111',
          '1111111111111111',
          '1177777111111111',
          '7777777777111111'
        ]
      },
      quiz: placeholderQuiz('GRAIL')
    },

    {
      id: 'viking1',
      body: 'mars',
      placeholder: true,
      cover: '#7a3320',
      title: { en: 'Viking 1', es: 'Viking 1' },
      subtitle: { en: 'The first Mars lander', es: 'El primer aterrizador en Marte' },
      craftName: { en: 'Viking 1', es: 'Viking 1' },
      backText: null,
      site: {
        name: { en: 'Viking 1 lander, Chryse Planitia', es: 'Aterrizador Viking 1, Chryse Planitia' },
        lat: 22.48, lon: -47.94, note: null
      },
      pages: placeholderPages(),
      art: {
        palette: {
          '1': { color: '#16244a', name: { en: 'Sky', es: 'Cielo' } },
          '2': { color: '#ffd23f', name: { en: 'Gold', es: 'Dorado' } },
          '3': { color: '#c1440e', name: { en: 'Mars soil', es: 'Suelo marciano' } },
          '4': { color: '#c7ccd6', name: { en: 'Silver', es: 'Plata' } },
          '5': { color: '#5d6675', name: { en: 'Steel', es: 'Acero' } },
          '8': { color: '#ffffff', name: { en: 'Dish', es: 'Antena' } }
        },
        grid: [
          '1111111111111111',
          '1111111111188111',
          '1111111111858111',
          '1111111111151111',
          '1111444444441111',
          '1114444444444111',
          '1114455445544111',
          '1114444444444111',
          '1112222222222111',
          '1151111111111511',
          '1511111111111151',
          '5111111111111115',
          '4411111111111144',
          '3333333333333333',
          '3333333333333333',
          '3333333333333333'
        ]
      },
      quiz: placeholderQuiz('Viking 1')
    },

    {
      id: 'opportunity',
      body: 'mars',
      placeholder: true,
      cover: '#8a5a1c',
      title: { en: 'Opportunity', es: 'Opportunity' },
      subtitle: { en: 'The rover that kept going', es: 'El róver que no se detuvo' },
      craftName: { en: 'Opportunity', es: 'Opportunity' },
      backText: null,
      site: {
        name: { en: 'Opportunity, Perseverance Valley', es: 'Opportunity, Valle Perseverance' },
        lat: -2.3, lon: -5.3, note: null
      },
      pages: placeholderPages(),
      art: {
        palette: {
          '1': { color: '#16244a', name: { en: 'Sky', es: 'Cielo' } },
          '2': { color: '#ffd23f', name: { en: 'Gold', es: 'Dorado' } },
          '3': { color: '#c1440e', name: { en: 'Mars soil', es: 'Suelo marciano' } },
          '4': { color: '#3a6fd8', name: { en: 'Solar panel', es: 'Panel solar' } },
          '5': { color: '#5d6675', name: { en: 'Steel', es: 'Acero' } },
          '6': { color: '#111111', name: { en: 'Wheels', es: 'Ruedas' } },
          '8': { color: '#ffffff', name: { en: 'Camera', es: 'Cámara' } }
        },
        grid: [
          '1111111111111111',
          '1111111111111111',
          '1111111111111111',
          '1111111111118811',
          '1111111111115111',
          '1111111111115111',
          '1444444444444441',
          '1144444444444411',
          '1111222222222111',
          '1111222222222111',
          '1115515515515111',
          '1116616616616111',
          '3333333333333333',
          '3333333333333333',
          '3333333333333333',
          '3333333333333333'
        ]
      },
      quiz: placeholderQuiz('Opportunity')
    }
  ];

  /* ---------- Our Mission (placeholders) ---------- */

  var mission = {
    sections: [
      { h: { en: 'Our goal', es: 'Nuestro objetivo' }, p: { en: '[Project goal coming soon.]', es: '[Objetivo del proyecto próximamente.]' } },
      { h: { en: 'Who it is for', es: 'Para quién es' }, p: { en: 'Teenagers (13–18) and classrooms.', es: 'Adolescentes (13 a 18 años) y salones de clase.' } },
      { h: { en: 'NASA sources', es: 'Fuentes de la NASA' }, p: { en: '[Source list coming soon.]', es: '[Lista de fuentes próximamente.]' } },
      { h: { en: 'Our team', es: 'Nuestro equipo' }, p: { en: '[Team members coming soon.]', es: '[Integrantes del equipo próximamente.]' } },
      { h: { en: 'How we used AI', es: 'Cómo usamos la IA' }, p: { en: '[AI-use note coming soon.]', es: '[Nota sobre el uso de IA próximamente.]' } }
    ]
  };

  window.ABNF_DATA = { ui: ui, books: books, mission: mission };
})();
