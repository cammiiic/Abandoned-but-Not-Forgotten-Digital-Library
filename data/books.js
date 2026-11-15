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
      homeExplore: 'Explore',
      feedLive: 'LIVE',
      heroCaption: 'Eagle at Tranquility Base, July 1969',
      statBooks: 'books',
      statWorlds: 'worlds',
      statLangs: 'languages',
      tileLibrary: 'Four illustrated books with narration, coloring and quizzes.',
      tileWhere: 'Then and now: see each spacecraft on its mission and today.',
      tileMap: 'Find where each one rests on the Moon and Mars.',
      tileMission: 'Why we made this, our team and our NASA sources.',

      libraryTitle: 'The Library',
      libraryIntro: 'Pick a book from the shelf. Each one has a story, a coloring page and a quiz.',
      moon: 'The Moon',
      mars: 'Mars',
      comingSoon: 'Coming soon',

      backToLibrary: 'Library',
      prev: 'Back',
      next: 'Next',
      pageOf: 'Page {n} of {t}',
      pagesOf: 'Pages {a}–{b} of {t}',
      contents: 'Contents',
      readerHint: 'Tip: drag the page with your finger or mouse to turn it. Arrow keys work too.',
      coverKickerMoon: 'Left on the Moon',
      coverKickerMars: 'Left on Mars',
      openBook: 'Open the book',
      part: 'Part {n}',
      listen: 'Listen',
      pause: 'Pause',
      audiobook: 'Audiobook',
      abPlay: 'Play',
      abResume: 'Resume',
      abSeek: 'Position in this part',
      abPrev: 'Previous part',
      abNext: 'Next part',
      abSpeed: 'Reading speed',
      abAuto: 'Auto-turn',
      on: 'ON',
      off: 'OFF',
      abAutoOnTip: 'Auto-turn is on: when a part ends, the next one plays and the page turns by itself.',
      abAutoOffTip: 'Auto-turn is off: the narration stops at the end of each part and you turn the pages.',
      abPartOf: 'Part {n} of {t}',
      noNarration: 'No narration for this part yet.',
      abEnd: 'The end. Thanks for listening!',
      listenBook: 'Listen to the audiobook',
      nowPlaying: 'Now playing',
      translationPending: 'Spanish translation coming soon. Showing the English text for now.',
      backCover: 'Abandoned, but not forgotten.',
      readAgain: 'Read again',

      activity: 'Activity',
      colorTitle: 'Color by number',
      colorHelp: 'Pick a color, then paint every square with its number. Drag to paint many at once. Pinch or scroll to zoom; drag with two fingers (or use Move) to look around.',
      colors: 'Colors',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      toolPaint: 'Paint',
      toolMove: 'Move',
      fit: 'Fit',
      find: 'Find',
      findHint: 'Jump to a square that still needs this color',
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
      whereThen: 'On its mission',
      whereNow: 'Today',
      thenNow: 'Then & now',
      statusLabel: 'Status',
      whereTimeline: 'Timeline',
      readItsBook: 'Read its book',
      seeOnMap: 'See it on the map',
      dirN: 'N', dirS: 'S', dirE: 'E', dirW: 'W',
      mapOf: 'Map of {body}',
      restingPlace: 'Resting place',
      approx: 'approximate',
      mapPick: 'Tap a pin to see which spacecraft rests there.',
      mapNote: 'Illustrated pixel map, not to scale. Pin locations are approximate.',
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
      homeExplore: 'Explorar',
      feedLive: 'EN VIVO',
      heroCaption: 'Eagle en la Base Tranquilidad, julio de 1969',
      statBooks: 'libros',
      statWorlds: 'mundos',
      statLangs: 'idiomas',
      tileLibrary: 'Cuatro libros ilustrados con narración, páginas para colorear y cuestionarios.',
      tileWhere: 'Antes y ahora: mira cada nave en su misión y cómo está hoy.',
      tileMap: 'Encuentra dónde descansa cada una en la Luna y en Marte.',
      tileMission: 'Por qué lo hicimos, nuestro equipo y nuestras fuentes de la NASA.',

      libraryTitle: 'La Biblioteca',
      libraryIntro: 'Elige un libro del estante. Cada uno tiene una historia, una página para colorear y un cuestionario.',
      moon: 'La Luna',
      mars: 'Marte',
      comingSoon: 'Próximamente',

      backToLibrary: 'Biblioteca',
      prev: 'Atrás',
      next: 'Siguiente',
      pageOf: 'Página {n} de {t}',
      pagesOf: 'Páginas {a}–{b} de {t}',
      contents: 'Contenido',
      readerHint: 'Consejo: arrastra la página con el dedo o el ratón para pasarla. También funcionan las flechas del teclado.',
      coverKickerMoon: 'Dejado en la Luna',
      coverKickerMars: 'Dejado en Marte',
      openBook: 'Abrir el libro',
      part: 'Parte {n}',
      listen: 'Escuchar',
      pause: 'Pausa',
      audiobook: 'Audiolibro',
      abPlay: 'Reproducir',
      abResume: 'Continuar',
      abSeek: 'Posición en esta parte',
      abPrev: 'Parte anterior',
      abNext: 'Parte siguiente',
      abSpeed: 'Velocidad de lectura',
      abAuto: 'Pasar páginas',
      on: 'SÍ',
      off: 'NO',
      abAutoOnTip: 'Pasar páginas está activado: al terminar una parte, empieza la siguiente y la página se pasa sola.',
      abAutoOffTip: 'Pasar páginas está desactivado: la narración se detiene al final de cada parte y tú pasas las páginas.',
      abPartOf: 'Parte {n} de {t}',
      noNarration: 'Esta parte aún no tiene narración.',
      abEnd: 'Fin. ¡Gracias por escuchar!',
      listenBook: 'Escuchar el audiolibro',
      nowPlaying: 'Reproduciendo',
      translationPending: 'La traducción al español llegará pronto. Por ahora se muestra el texto en inglés.',
      backCover: 'Abandonado, pero no olvidado.',
      readAgain: 'Leer de nuevo',

      activity: 'Actividad',
      colorTitle: 'Colorea por números',
      colorHelp: 'Elige un color y pinta cada casilla que tenga su número. Arrastra para pintar varias a la vez. Pellizca o usa la rueda del ratón para hacer zoom; arrastra con dos dedos (o usa Mover) para moverte.',
      colors: 'Colores',
      zoomIn: 'Acercar',
      zoomOut: 'Alejar',
      toolPaint: 'Pintar',
      toolMove: 'Mover',
      fit: 'Ajustar',
      find: 'Buscar',
      findHint: 'Ir a una casilla que todavía necesita este color',
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
      whereThen: 'En su misión',
      whereNow: 'Hoy',
      thenNow: 'Antes y ahora',
      statusLabel: 'Estado',
      whereTimeline: 'Línea del tiempo',
      readItsBook: 'Leer su libro',
      seeOnMap: 'Verla en el mapa',
      dirN: 'N', dirS: 'S', dirE: 'E', dirW: 'O',
      mapOf: 'Mapa de {body}',
      restingPlace: 'Lugar de descanso',
      approx: 'aproximado',
      mapPick: 'Toca un marcador para ver qué nave descansa allí.',
      mapNote: 'Mapa ilustrado en pixel art, no está a escala. Las ubicaciones de los marcadores son aproximadas.',
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
      now: {
        status: { en: 'Descent stage on the surface. Ascent stage lost.', es: 'Etapa de descenso en la superficie. Etapa de ascenso perdida.' },
        text: {
          en: 'The bottom half of Eagle still stands at Tranquility Base, surrounded by footprints. The top half was left orbiting the Moon in 1969 and nobody knows where it ended up. The laser mirror the astronauts set up is still used by scientists today.',
          es: 'La mitad inferior del Eagle sigue en la Base Tranquilidad, rodeada de huellas. La mitad superior quedó orbitando la Luna en 1969 y nadie sabe dónde terminó. El espejo láser que instalaron los astronautas todavía lo usan los científicos hoy.'
        }
      },
      timeline: [
        { date: { en: 'Jul 16, 1969', es: '16 jul 1969' }, text: { en: 'Launches on a Saturn V rocket from Florida.', es: 'Despega en un cohete Saturno V desde Florida.' } },
        { date: { en: 'Jul 20, 1969', es: '20 jul 1969' }, text: { en: 'Lands in the Sea of Tranquility: "The Eagle has landed." Hours later, the first human steps on the Moon.', es: 'Aterriza en el Mar de la Tranquilidad: «El Eagle ha aterrizado». Horas después, los primeros pasos humanos en la Luna.' } },
        { date: { en: 'Jul 21, 1969', es: '21 jul 1969' }, text: { en: 'The top half lifts off; the bottom half stays behind as a launch pad.', es: 'La mitad superior despega; la inferior se queda como plataforma de lanzamiento.' } },
        { date: { en: 'Jul 21, 1969', es: '21 jul 1969' }, text: { en: 'The empty top half is released into orbit around the Moon.', es: 'La mitad superior, vacía, queda en órbita alrededor de la Luna.' } },
        { date: { en: 'Aug 27, 1969', es: '27 ago 1969' }, text: { en: 'The science station left on the surface goes silent.', es: 'La estación científica que quedó en la superficie enmudece.' } },
        { date: { en: 'Today', es: 'Hoy' }, text: { en: 'Scientists still bounce lasers off the mirror left at Tranquility Base.', es: 'Los científicos siguen enviando láseres al espejo que quedó en la Base Tranquilidad.' } }
      ],
      pages: [
        {
          title: { en: 'Meet Eagle', es: 'Conoce a Eagle' },
          text: {
            en: 'On July 16, 1969, a very big rocket named Saturn V launched from Florida carrying three astronauts: Neil Armstrong, Michael Collins, and Buzz Aldrin. Their mission, Apollo 11, had a goal that no one had ever achieved: to land humans on the Moon and bring them back to Earth safely.\n\n' +
                'They traveled inside a spaceship called Columbia, and attached to it was a smaller, weird-looking vessel called Eagle, the lunar module. Eagle had been built to perform one special job, which was to carry two astronauts from Columbia down to the Moon and then back up. This vessel was never meant to touch Earth\'s sky or return home. It had been made for the Moon.\n\n' +
                'Eagle had two parts stacked on top of each other. The bottom half had four long legs with round feet, almost looking like an insect, and it also carried the tools and science experiments that the astronauts were going to use on the Moon. The top half was the cabin where the astronauts would live and work, and it had its own smaller engine to launch them back into space.\n\n' +
                'The cabin was tiny, about the size of a small closet for two people, and had no seats at all, to save weight. Eagle looked fragile, almost like it was made of foil, but what no one would ever imagine was that a small weird-looking vessel like Eagle was about to make history.',
            es: 'El 16 de julio de 1969, un cohete de gran tamaño llamado Saturno V despegó desde Florida con tres astronautas a bordo: Neil Armstrong, Michael Collins y Buzz Aldrin. Su misión, el Apolo 11, tenía un objetivo que nadie había logrado jamás: llevar seres humanos a la Luna y traerlos de vuelta a la Tierra sanos y salvos.\n\n' +
                'Viajaban en una nave espacial llamada Columbia, a la cual estaba acoplado un vehículo más pequeño de aspecto peculiar: Eagle, el módulo lunar. Eagle fue construido para una tarea específica: transportar a dos astronautas desde el Columbia hasta la superficie lunar y, posteriormente, devolverlos a la nave principal. Este vehículo nunca fue diseñado para entrar en la atmósfera terrestre ni para regresar a la Tierra; fue creado exclusivamente para la Luna.\n\n' +
                'El Eagle constaba de dos secciones superpuestas. La parte inferior contaba con cuatro patas largas terminadas en bases circulares, lo que le daba un aspecto similar al de un insecto, y albergaba las herramientas y los experimentos científicos que los astronautas utilizarían en la Luna. La parte superior era la cabina, donde los astronautas vivirían y trabajarían; esta disponía de su propio motor, más pequeño, destinado a impulsarlos de regreso al espacio.\n\n' +
                'La cabina era diminuta, aproximadamente del tamaño de un armario pequeño para dos personas, y carecía de asientos, con el fin de ahorrar peso. Eagle parecía frágil, casi como si estuviera hecho de papel de aluminio; sin embargo, nadie habría imaginado que una nave tan pequeña y de aspecto tan extraño estaba a punto de hacer historia.'
          }
        },
        {
          title: { en: 'The Landing', es: 'El aterrizaje' },
          text: {
            en: 'On July 20, 1969, after three days of traveling, the spacecraft finally reached the Moon. Then, Armstrong and Aldrin got into Eagle, and Eagle detached itself from Columbia. Collins stayed in Columbia, orbiting the Moon, while Armstrong and Aldrin flew Eagle down. It took the engine about 12 minutes to slow them down. The landing wasn\'t easy: alarms started going off on Eagle\'s computer because it was overloaded with work. As they got closer to the ground, Armstrong saw that the computer was taking them toward an area full of rocks, so he took control and flew Eagle to a safe spot. They managed to land in a flat, dark area called the Sea of Tranquility. Then, Armstrong sent his famous message back to Earth: "Houston, Tranquility Base here. The Eagle has landed." This meant that for the first time ever, humans had landed in another world.',
            es: 'El 20 de julio de 1969, tras tres días de viaje, la nave espacial llegó finalmente a la Luna. Entonces, Armstrong y Aldrin subieron al Eagle, el cual se separó del Columbia. Collins permaneció en el Columbia, orbitando la Luna, mientras Armstrong y Aldrin descendían a bordo del Eagle. El motor tardó unos 12 minutos en reducir su velocidad. El aterrizaje no fue sencillo: empezaron a sonar alarmas en la computadora del Eagle debido a una sobrecarga de trabajo. A medida que se acercaban a la superficie, Armstrong observó que la computadora los dirigía hacia una zona llena de rocas, por lo que tomó el control y dirigió el Eagle hacia un lugar seguro. Lograron aterrizar en una zona plana y oscura llamada Mar de la Tranquilidad. Luego, Armstrong envió su famoso mensaje a la Tierra: «Houston, aquí Base Tranquilidad. El Eagle ha aterrizado». Esto significaba que, por primera vez en la historia, los seres humanos habían aterrizado en otro mundo.'
          }
        },
        {
          title: { en: 'Footprints', es: 'Huellas' },
          text: {
            en: 'A few hours later, Armstrong climbed down Eagle\'s ladder, and when he stepped onto the Moon, he said, "That\'s one small step for man, one giant leap for mankind." Aldrin followed him and described the empty landscape as "magnificent desolation." On one of Eagle\'s legs there was a plaque, which read: "We came in peace for all mankind." They spent about two and a half hours outside, and they planted a specially designed flag. It had a horizontal bar along the top that kept the nylon stretched out, so it looked like it was flying. They also talked by phone with the U.S. president Richard Nixon and collected around 22 kilograms of Moon rocks and soil. Before going back inside Eagle, they set up a small science station and left a packet of memorial items on the ground.',
            es: 'Unas horas más tarde, Armstrong bajó por la escalerilla del Eagle y, al pisar la Luna, pronunció estas palabras: «Es un pequeño paso para el hombre, pero un gran salto para la humanidad». Aldrin lo siguió y describió el paisaje desolado como una «magnífica desolación». En una de las patas del Eagle había una placa que decía: «Vinimos en paz en nombre de toda la humanidad». Pasaron cerca de dos horas y media en el exterior y colocaron una bandera diseñada especialmente para la ocasión; contaba con una barra horizontal en la parte superior que mantenía el nailon extendido, dando la impresión de que la bandera estaba ondeando. También hablaron por teléfono con el presidente de los Estados Unidos, Richard Nixon, y recolectaron alrededor de 22 kilogramos de rocas y suelo lunar. Antes de regresar al interior del Eagle, instalaron una pequeña estación científica y dejaron en el suelo un paquete con objetos conmemorativos.'
          }
        },
        {
          title: { en: 'Goodbye', es: 'La despedida' },
          text: {
            en: 'After almost an entire day, it was time for them to leave the Moon. The top half of Eagle launched into space, and the bottom half, which made Eagle look like an insect, remained on the Moon.\n\n' +
                'It\'s still there today, like a launch pad no one will ever use again. Eagle reconnected with Columbia, and Armstrong and Aldrin got back into the big spaceship with Collins. Then they released Eagle into orbit around the Moon, by itself and empty, its mission successfully completed. The three astronauts flew back to Earth as icons, and Eagle? It stayed behind.',
            es: 'Tras casi un día entero, llegó el momento de abandonar la Luna. La mitad superior del Eagle despegó hacia el espacio, mientras que la mitad inferior —que le daba al Eagle un aspecto similar al de un insecto— permaneció en la Luna. Todavía está allí hoy, como una plataforma de lanzamiento que nadie volverá a utilizar jamás. El Eagle se reencontró con el Columbia, y Armstrong y Aldrin regresaron a la gran nave espacial junto a Collins. Luego, dejaron al Eagle en órbita alrededor de la Luna, solo y vacío, con su misión cumplida con éxito. Los tres astronautas regresaron a la Tierra convertidos en iconos; ¿y el Eagle? Se quedó atrás.'
          }
        },
        {
          title: { en: 'Lost, but Not Forgotten', es: 'Perdido, pero no olvidado' },
          text: {
            en: 'What happened to Eagle after that? Nobody is one hundred percent sure about this. NASA believed it slowly lost height and crashed somewhere on the Moon after a few months, but no one ever saw it fall, and no one has ever found its crash site. Some researchers have suggested it could still be orbiting the Moon today, though this has not been confirmed. The science station left by Armstrong and Aldrin didn\'t last long either; it ran on sunlight and only worked during the day. On August 27, 1969, it stopped answering and went silent.\n\n' +
                'Not everything was lost, though. The mirror the astronauts left behind needs no power, and scientists still shoot lasers at it. So, Eagle is lost and its science station is quiet, but the story of the weird-looking vessel that carried humans\' first steps on another world will never be forgotten.',
            es: '¿Qué le ocurrió al Eagle después de aquello? Nadie está totalmente seguro. La NASA creía que fue perdiendo altura poco a poco hasta estrellarse en algún lugar de la Luna al cabo de unos meses; sin embargo, nadie presenció su caída y jamás se ha hallado el lugar del impacto. Algunos investigadores han sugerido que podría seguir orbitando la Luna hoy en día, aunque esto no se ha confirmado. La estación científica que dejaron Armstrong y Aldrin tampoco duró mucho: funcionaba con energía solar, por lo que solo estaba operativa durante el día. El 27 de agosto de 1969, dejó de responder y quedó en silencio.\n\n' +
                'No obstante, no todo se perdió. El espejo que dejaron los astronautas no requiere energía, y los científicos siguen apuntándole con láseres. Así pues, aunque el Eagle se ha perdido y su estación científica permanece en silencio, la historia de aquella nave de aspecto peculiar —que transportó a los seres humanos en sus primeros pasos sobre otro mundo— jamás será olvidada.'
          }
        }
      ],
      art: {
        background: '1', // pre-filled on the coloring page
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
      // answers[0] is the correct one; the site shuffles them on screen
      quiz: [
        {
          q: { en: 'After how many days of traveling did the spacecraft reach the Moon?', es: '¿Después de cuántos días de viaje llegó la nave a la Luna?' },
          answers: [
            { en: 'Three days', es: 'Tres días' },
            { en: 'One day', es: 'Un día' },
            { en: 'One week', es: 'Una semana' },
            { en: 'Three weeks', es: 'Tres semanas' }
          ], correct: 0
        },
        {
          q: { en: 'What was the name of the area where Armstrong and Aldrin landed?', es: '¿Cómo se llamaba la zona donde aterrizaron Armstrong y Aldrin?' },
          answers: [
            { en: 'The Sea of Tranquility', es: 'El Mar de la Tranquilidad' },
            { en: 'The Ocean of Storms', es: 'El Océano de las Tormentas' },
            { en: 'The Sea of Crises', es: 'El Mar de las Crisis' },
            { en: 'The Golden Plain', es: 'La Llanura Dorada' }
          ], correct: 0
        },
        {
          q: { en: 'How did Aldrin describe the empty landscape?', es: '¿Cómo describió Aldrin el paisaje vacío?' },
          answers: [
            { en: '"Magnificent desolation"', es: '«Magnífica desolación»' },
            { en: '"A silent wonderland"', es: '«Un país de las maravillas silencioso»' },
            { en: '"A gray, endless desert"', es: '«Un desierto gris e infinito»' },
            { en: '"The loneliest place in the universe"', es: '«El lugar más solitario del universo»' }
          ], correct: 0
        },
        {
          q: { en: 'When did the science station stop answering?', es: '¿Cuándo dejó de responder la estación científica?' },
          answers: [
            { en: 'August 27, 1969', es: '27 de agosto de 1969' },
            { en: 'July 21, 1969', es: '21 de julio de 1969' },
            { en: 'December 31, 1969', es: '31 de diciembre de 1969' },
            { en: 'July 20, 1970', es: '20 de julio de 1970' }
          ], correct: 0
        },
        {
          q: { en: 'What did Armstrong say after stepping onto the Moon?', es: '¿Qué dijo Armstrong al pisar la Luna?' },
          answers: [
            { en: '"That\'s one small step for man, one giant leap for mankind."', es: '«Es un pequeño paso para el hombre, pero un gran salto para la humanidad».' },
            { en: '"Houston, Tranquility Base here. The Eagle has landed."', es: '«Houston, aquí Base Tranquilidad. El Eagle ha aterrizado».' },
            { en: '"We came in peace for all mankind."', es: '«Vinimos en paz en nombre de toda la humanidad».' },
            { en: '"Magnificent desolation."', es: '«Magnífica desolación».' }
          ], correct: 0
        },
        {
          q: { en: 'When did the Saturn V rocket launch?', es: '¿Cuándo despegó el cohete Saturno V?' },
          answers: [
            { en: 'July 16, 1969', es: '16 de julio de 1969' },
            { en: 'July 20, 1969', es: '20 de julio de 1969' },
            { en: 'July 4, 1969', es: '4 de julio de 1969' },
            { en: 'August 27, 1969', es: '27 de agosto de 1969' }
          ], correct: 0
        },
        {
          q: { en: 'What did the writer compare the size of Eagle\'s cabin (its top half) to?', es: '¿Con qué comparó la escritora el tamaño de la cabina del Eagle (su mitad superior)?' },
          answers: [
            { en: 'A small closet for two people', es: 'Un armario pequeño para dos personas' },
            { en: 'A school bus', es: 'Un autobús escolar' },
            { en: 'A two-car garage', es: 'Un garaje para dos coches' },
            { en: 'A shoebox', es: 'Una caja de zapatos' }
          ], correct: 0
        },
        {
          q: { en: 'What did NASA believe happened to Eagle after it was released?', es: '¿Qué creía la NASA que le pasó al Eagle después de soltarlo?' },
          answers: [
            { en: 'It slowly lost height and crashed somewhere on the Moon', es: 'Fue perdiendo altura poco a poco y se estrelló en algún lugar de la Luna' },
            { en: 'It flew back to Earth on its own', es: 'Regresó solo a la Tierra' },
            { en: 'It landed safely next to its bottom half', es: 'Aterrizó sano y salvo junto a su mitad inferior' },
            { en: 'It drifted away toward Mars', es: 'Se fue flotando hacia Marte' }
          ], correct: 0
        },
        {
          q: { en: 'What did the plaque on one of Eagle\'s legs say?', es: '¿Qué decía la placa en una de las patas del Eagle?' },
          answers: [
            { en: '"We came in peace for all mankind."', es: '«Vinimos en paz en nombre de toda la humanidad».' },
            { en: '"Property of NASA. Do not touch."', es: '«Propiedad de la NASA. No tocar».' },
            { en: '"To the Moon and back."', es: '«A la Luna y de regreso».' },
            { en: '"Built in Florida, 1969."', es: '«Construido en Florida, 1969».' }
          ], correct: 0
        },
        {
          q: { en: 'What did Armstrong and Aldrin leave on the Moon\'s ground before going back inside Eagle?', es: '¿Qué dejaron Armstrong y Aldrin en el suelo lunar antes de volver a entrar al Eagle?' },
          answers: [
            { en: 'A packet of memorial items', es: 'Un paquete con objetos conmemorativos' },
            { en: 'Their space suits', es: 'Sus trajes espaciales' },
            { en: 'A time capsule with letters from students', es: 'Una cápsula del tiempo con cartas de estudiantes' },
            { en: 'A spare engine for Columbia', es: 'Un motor de repuesto para el Columbia' }
          ], correct: 0
        }
      ]
    },

    {
      id: 'grail',
      body: 'moon',
      cover: '#4a3570',
      title: { en: 'GRAIL', es: 'GRAIL' },
      subtitle: { en: 'Ebb and Flow', es: 'Ebb y Flow' },
      craftName: { en: 'Ebb and Flow', es: 'Ebb y Flow' },
      backText: { en: 'Abandoned, but not forgotten.', es: 'Abandonados, pero no olvidados.' },
      site: {
        name: { en: 'GRAIL Ebb & Flow, Sally K. Ride Impact Site', es: 'GRAIL Ebb y Flow, sitio de impacto Sally K. Ride' },
        lat: 75.62, lon: -26.63, note: null
      },
      now: {
        status: { en: 'Crashed together on purpose, Dec 17, 2012.', es: 'Se estrellaron juntas a propósito el 17 dic 2012.' },
        text: {
          en: 'Ebb and Flow rest side by side on a mountain near the Moon\'s north pole, at the Sally K. Ride Impact Site. Their gravity map is still used by scientists studying how the Moon formed.',
          es: 'Ebb y Flow descansan una junto a la otra en una montaña cerca del polo norte de la Luna, en el sitio de impacto Sally K. Ride. Los científicos siguen usando su mapa de gravedad para estudiar cómo se formó la Luna.'
        }
      },
      timeline: [
        { date: { en: 'Sep 10, 2011', es: '10 sep 2011' }, text: { en: 'The twins launch together from Florida.', es: 'Las gemelas despegan juntas desde Florida.' } },
        { date: { en: 'Dec 31, 2011', es: '31 dic 2011' }, text: { en: 'Ebb reaches the Moon first, on New Year\'s Eve.', es: 'Ebb llega primero a la Luna, en la víspera de Año Nuevo.' } },
        { date: { en: 'Jan 1, 2012', es: '1 ene 2012' }, text: { en: 'Flow arrives. The twins line up and start orbiting together.', es: 'Llega Flow. Las gemelas se alinean y empiezan a orbitar juntas.' } },
        { date: { en: 'Mar–Dec 2012', es: 'mar–dic 2012' }, text: { en: 'They map the Moon\'s gravity, and students take photos with MoonKAM.', es: 'Mapean la gravedad de la Luna y los estudiantes toman fotos con MoonKAM.' } },
        { date: { en: 'Jul 2012', es: 'jul 2012' }, text: { en: 'Sally Ride, who ran MoonKAM, passes away.', es: 'Fallece Sally Ride, quien dirigía MoonKAM.' } },
        { date: { en: 'Dec 17, 2012', es: '17 dic 2012' }, text: { en: 'Out of fuel, Ebb and then Flow hit a mountain near the north pole.', es: 'Sin combustible, Ebb y luego Flow impactan una montaña cerca del polo norte.' } },
        { date: { en: 'Today', es: 'Hoy' }, text: { en: 'They rest at the Sally K. Ride Impact Site.', es: 'Descansan en el sitio de impacto Sally K. Ride.' } }
      ],
      pages: [
        {
          title: { en: 'The Twins', es: 'Los gemelos' },
          text: {
            en: 'On September 10, 2011, a rocket launched from Florida, carrying two identical spacecraft. They were like twins, both built to work together as a team. Their mission was called GRAIL, and their main job was to study the Moon\'s gravity. In the beginning, the twins had no names, so NASA held a contest for students. A class of fourth-graders in Montana won, and they gave the twins the names of Ebb and Flow, just like ocean tides, which are caused by the Moon\'s gravity. Beautiful meaning, right?',
            es: 'El 10 de septiembre de 2011, un cohete despegó desde Florida llevando a bordo dos naves espaciales idénticas. Eran como gemelas, construidas para trabajar juntas como un equipo. Su misión se llamaba GRAIL y su objetivo principal era estudiar la gravedad de la Luna. Al principio, las gemelas no tenían nombre, así que la NASA organizó un concurso para estudiantes. Una clase de cuarto grado en Montana resultó ganadora y bautizó a las naves como Ebb y Flow, haciendo referencia a las mareas oceánicas, las cuales son provocadas por la gravedad de la Luna. Un significado precioso, ¿verdad?'
          }
        },
        {
          title: { en: 'The Long Trip', es: 'El largo viaje' },
          text: {
            en: 'It took the Apollo astronauts three days to reach the Moon, but the twins took the slow way to save fuel, which made the trip take more than three months. Ebb arrived before Flow, on New Year\'s Eve 2011. Ebb waited alone for its twin, Flow, to arrive so they could work together as the team they were. How sweet!\n\n' +
                'Then, a day later, Flow finally arrived. Once they were both together, they lined up one behind the other and started orbiting the Moon, like two cars on a raceway.',
            es: 'A los astronautas del programa Apolo les tomó tres días llegar a la Luna, pero las gemelas optaron por una ruta más lenta para ahorrar combustible, lo que hizo que el viaje durara más de tres meses. Ebb llegó antes que Flow, en la víspera de Año Nuevo de 2011. Ebb esperó a solas a que llegara su gemela, Flow, para poder trabajar juntas como el equipo que eran. ¡Qué tierno!\n\n' +
                'Un día después, Flow finalmente llegó. Una vez reunidas, se colocaron una detrás de la otra y comenzaron a orbitar la Luna, como dos coches en una pista de carreras.'
          }
        },
        {
          title: { en: 'The Invisible Map', es: 'El mapa invisible' },
          text: {
            en: 'The Moon\'s gravity isn\'t the same everywhere. Some areas have very heavy rocks hidden underground that pull a bit harder, and when the twins flew over those places, the distance between them changed by a tiny bit, smaller than the width of human hair. After measuring those changes for almost nine months, Ebb and Flow made the most detailed gravity map of the Moon to ever exist. This showed scientists that those heavy spots were created billions of years ago, when very big asteroids crashed into the Moon\'s surface.',
            es: 'La gravedad de la Luna no es igual en todas partes. En algunas zonas, hay rocas muy pesadas ocultas bajo la superficie que ejercen una mayor atracción; cuando las gemelas sobrevolaban estos lugares, la distancia entre ellas variaba ligeramente, en una medida menor al grosor de un cabello humano. Tras registrar estos cambios durante casi nueve meses, Ebb y Flow crearon el mapa de gravedad de la Luna más detallado que ha existido jamás. Esto reveló a los científicos que dichas zonas de mayor densidad se formaron hace miles de millones de años, cuando asteroides de gran tamaño impactaron contra la superficie lunar.'
          }
        },
        {
          title: { en: 'Students in Space', es: 'Estudiantes en el espacio' },
          text: {
            en: 'One very interesting fact about the twins is that they carried cameras called MoonKAM, and these allowed middle school students across the country to control them. The students chose places on the Moon, and the twins would take pictures for them.\n\n' +
                'The program was run by Sally Ride\'s organization. You may be wondering: who is Sally Ride?\n\n' +
                'Sally Ride was the first American woman in space, and she really wanted young people to develop a love for science. Sadly, she passed away in 2012, while the twins were still orbiting the Moon.',
            es: 'Un dato muy interesante sobre estas gemelas es que llevaban a bordo unas cámaras llamadas MoonKAM, las cuales permitían que estudiantes de secundaria de todo el país las controlaran. Los alumnos elegían lugares en la Luna y las gemelas tomaban fotografías para ellos. El programa estaba dirigido por la organización de Sally Ride. Quizás te preguntes: ¿quién es Sally Ride?\n\n' +
                'Sally Ride fue la primera mujer estadounidense en el espacio, y deseaba profundamente que los jóvenes desarrollaran un amor por la ciencia. Lamentablemente, falleció en 2012, mientras los «gemelos» aún orbitaban la Luna.'
          }
        },
        {
          title: { en: 'Together Until the End', es: 'Juntos hasta el final' },
          text: {
            en: 'By December 2012, the twins were already running out of fuel, and instead of just letting them crash anywhere, NASA chose a mountain near the Moon\'s north pole. On December 17, 2012, Ebb hit the mountain first, and then Flow followed just a few seconds later, right beside Ebb.\n\n' +
                'NASA then named the crash site after Sally Ride, so the twins would rest in a place named after someone who believed that young people could reach the stars. In a way, the twins made that true: they connected young people with space.\n\n' +
                'They stayed together until the very end.',
            es: 'Para diciembre de 2012, a los «gemelos» ya se les estaba agotando el combustible. En lugar de dejar que se estrellaran en cualquier lugar, la NASA eligió una montaña cerca del polo norte lunar. El 17 de diciembre de 2012, Ebb impactó primero contra la montaña, y unos segundos después le siguió Flow, justo al lado de Ebb.\n\n' +
                'La NASA bautizó el lugar del impacto con el nombre de Sally Ride, de modo que los «gemelos» descansaran en un sitio que lleva el nombre de alguien que creía que los jóvenes podían alcanzar las estrellas. En cierto modo, los «gemelos» hicieron realidad esa idea: conectaron a los jóvenes con el espacio.\n\n' +
                'Permanecieron juntos hasta el mismísimo final.'
          }
        }
      ],
      art: {
        background: '1', // pre-filled on the coloring page
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
      cover: '#7a3320',
      title: { en: 'Viking 1', es: 'Viking 1' },
      subtitle: { en: 'The first Mars lander', es: 'El primer aterrizador en Marte' },
      craftName: { en: 'Viking 1', es: 'Viking 1' },
      backText: null,
      site: {
        name: { en: 'Viking 1 lander, Chryse Planitia', es: 'Aterrizador Viking 1, Chryse Planitia' },
        lat: 22.48, lon: -47.94, note: null
      },
      now: {
        status: { en: 'Silent since November 1982.', es: 'En silencio desde noviembre de 1982.' },
        text: {
          en: 'The lander still sits on the Golden Plain of Chryse Planitia, slowly gathering red dust. Its orbiter, out of fuel since 1980, still circles Mars. The question it asked, "Is there life on Mars?", is still being studied.',
          es: 'El módulo de aterrizaje sigue en la Llanura Dorada de Chryse Planitia, cubriéndose poco a poco de polvo rojo. Su orbitador, sin combustible desde 1980, todavía gira alrededor de Marte. La pregunta que hizo, «¿hay vida en Marte?», aún se sigue estudiando.'
        }
      },
      timeline: [
        { date: { en: 'Aug 20, 1975', es: '20 ago 1975' }, text: { en: 'Launches from Florida: an orbiter and a lander in one.', es: 'Despega desde Florida: un orbitador y un módulo de aterrizaje en uno.' } },
        { date: { en: 'Jun 1976', es: 'jun 1976' }, text: { en: 'Reaches Mars. The first landing spot looks too rough.', es: 'Llega a Marte. El primer lugar de aterrizaje parece demasiado accidentado.' } },
        { date: { en: 'Jul 20, 1976', es: '20 jul 1976' }, text: { en: 'Lands on Chryse Planitia: the first American spacecraft on Mars.', es: 'Aterriza en Chryse Planitia: la primera nave estadounidense en Marte.' } },
        { date: { en: 'Jul 1976', es: 'jul 1976' }, text: { en: 'Scoops up Martian soil to look for signs of life.', es: 'Recoge suelo marciano para buscar señales de vida.' } },
        { date: { en: 'Aug 7, 1980', es: '7 ago 1980' }, text: { en: 'Out of the fuel it uses to steer, the orbiter is shut down on its 1,489th orbit.', es: 'Sin el combustible que usa para orientarse, el orbitador se apaga en su órbita número 1489.' } },
        { date: { en: 'Jan 1982', es: 'ene 1982' }, text: { en: 'The lander is renamed the Thomas Mutch Memorial Station.', es: 'El módulo es rebautizado como Estación Conmemorativa Thomas Mutch.' } },
        { date: { en: 'Nov 11, 1982', es: '11 nov 1982' }, text: { en: 'A wrong command is sent by mistake. The lander goes silent.', es: 'Se envía un comando equivocado por error. El módulo enmudece.' } },
        { date: { en: 'Today', es: 'Hoy' }, text: { en: 'Still sitting on the Golden Plain, waiting.', es: 'Sigue en la Llanura Dorada, a la espera.' } }
      ],
      pages: [
        {
          title: { en: 'The Pair', es: 'El par' },
          text: {
            en: 'On August 20, 1975, a rocket launched from Florida carrying a new spacecraft called Viking 1. It was really two machines in one: an orbiter, which would orbit Mars from above, and a lander, which would go down to the surface. Together they had a big mission: to look for signs of life on Mars. Before launch there was a small surprise, and it was that the spacecraft that had to go first had a battery problem, so NASA decided to replace it with its twin, and the backup became Viking 1.',
            es: 'El 20 de agosto de 1975, un cohete despegó desde Florida transportando una nueva nave espacial llamada Viking 1. En realidad, se trataba de dos máquinas en una: un orbitador, que orbitaría Marte desde arriba, y un módulo de aterrizaje, que descendería hasta la superficie. Juntos tenían una gran misión: buscar señales de vida en Marte. Antes del lanzamiento surgió un pequeño imprevisto: la nave espacial que debía partir primero presentó un problema en su batería, por lo que la NASA decidió reemplazarla por su gemela, convirtiendo a la unidad de reserva en la Viking 1.'
          }
        },
        {
          title: { en: 'A Change of Plans', es: 'Un cambio de planes' },
          text: {
            en: 'After a long trip that was around ten months, Viking 1 finally reached Mars in June 1976. The orbiter started to take pictures of the spot where the lander was supposed to touch down, but the ground was way bumpier and more uneven than expected, and landing there could have destroyed the lander. So, scientists decided to use the new photos to pick a better spot: a smooth, wide place called Chryse Planitia, which means "Golden Plain."',
            es: 'Tras un largo viaje de unos diez meses, la Viking 1 llegó finalmente a Marte en junio de 1976. El orbitador comenzó a tomar fotografías del lugar donde estaba previsto que aterrizara el módulo; sin embargo, el terreno resultó ser mucho más irregular y accidentado de lo esperado, lo que habría puesto en peligro la integridad del módulo. Por ello, los científicos utilizaron las nuevas imágenes para seleccionar un lugar más adecuado: una zona amplia y llana llamada Chryse Planitia, que significa «llanura dorada».'
          }
        },
        {
          title: { en: 'First Look at Mars', es: 'Un primer vistazo a Marte' },
          text: {
            en: 'On July 20, 1976, the lander detached itself from the orbiter and fell through Mars\' thin air, testing it as it went down. It managed to land safely, becoming the first American spacecraft to ever land on Mars. Right away, it began to take photos of its new home: red dust and rocks. It was extremely cold there: −86 °C before sunrise and around −33 °C in the afternoon.\n\n' +
                'For the first time ever, humans on Earth were able to see what it was like to stand on Mars.',
            es: 'El 20 de julio de 1976, el módulo de aterrizaje se separó del orbitador y descendió a través de la tenue atmósfera marciana, realizando mediciones durante su trayectoria. Logró aterrizar sin contratiempos, convirtiéndose en la primera nave espacial estadounidense en posarse sobre Marte. De inmediato, comenzó a capturar imágenes de su nuevo entorno: polvo rojo y rocas. Las temperaturas eran extremadamente bajas: −86 °C antes del amanecer y alrededor de −33 °C durante la tarde.\n\n' +
                'Por primera vez en la historia, los seres humanos en la Tierra pudieron ver cómo era estar en la superficie de Marte.'
          }
        },
        {
          title: { en: 'Looking for Life', es: 'En busca de vida' },
          text: {
            en: 'A week later, the lander started looking for signs of life. It used its robot arm to scoop up some Martian soil and place it inside its mini laboratory. Some of the tests gave weird results that could have meant life, but, unfortunately, the most important test found no signs of it. Mars\' soil had a lot of sulfur, unlike anything that was found on Earth or the Moon. The mystery of life on Mars wasn\'t solved.\n\n' +
                'Scientists still argue about those results today. In the meantime, the lander kept sending weather updates for years.',
            es: 'Una semana más tarde, el módulo de aterrizaje comenzó a buscar indicios de vida. Utilizó su brazo robótico para recoger una muestra de suelo marciano y depositarla en el interior de su pequeño laboratorio. Algunas de las pruebas arrojaron resultados extraños que podrían haber indicado la presencia de vida; sin embargo, lamentablemente, el análisis más importante no halló ningún indicio de ella. El suelo marciano contenía una gran cantidad de azufre, algo nunca visto ni en la Tierra ni en la Luna. El misterio sobre la existencia de vida en Marte quedó sin resolver.\n\n' +
                'Hoy en día, los científicos siguen debatiendo sobre aquellos resultados. Mientras tanto, la sonda de aterrizaje continuó enviando información meteorológica durante años.'
          }
        },
        {
          title: { en: 'The Last Message', es: 'El último mensaje' },
          text: {
            en: 'Up in space, the orbiter kept working until 1980, when it ran out of fuel after orbiting Mars 1,489 times. Down below, the lander kept going alone on the ground, and, in 1982, it was renamed the Thomas Mutch Memorial Station, after the leader of the Viking camera team, who had passed away. Then, on November 11, 1982, someone on Earth had sent the wrong command to it by accident, and the lander stopped answering. NASA tried multiple times to reach it, but it had completely lost its connection to Earth.\n\n' +
                'After more than 6 years of work, Viking 1 went silent. Still sitting on the Golden Plain, waiting.',
            es: 'En el espacio, la sonda orbital siguió funcionando hasta 1980, momento en el que se quedó sin combustible tras haber orbitado Marte 1489 veces. En la superficie, la sonda de aterrizaje continuó operando por su cuenta; en 1982, fue rebautizada como «Estación Conmemorativa Thomas Mutch» (Thomas Mutch Memorial Station), en honor al jefe del equipo de cámaras de la misión Viking, quien había fallecido. Más tarde, el 11 de noviembre de 1982, alguien en la Tierra envió por error un comando incorrecto, tras lo cual la sonda dejó de responder. La NASA intentó contactarla en repetidas ocasiones, pero la conexión con la Tierra se había perdido por completo.\n\n' +
                'Tras más de seis años de actividad, la Viking 1 enmudeció. Allí sigue, en la «Llanura Dorada» (Golden Plain), a la espera.'
          }
        }
      ],
      art: {
        background: '1', // pre-filled on the coloring page
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
      cover: '#8a5a1c',
      title: { en: 'Opportunity', es: 'Opportunity' },
      subtitle: { en: 'The rover that kept going', es: 'El róver que no se detuvo' },
      craftName: { en: 'Opportunity', es: 'Opportunity' },
      backText: null,
      site: {
        name: { en: 'Opportunity, Perseverance Valley', es: 'Opportunity, Valle Perseverance' },
        lat: -2.3, lon: -5.3, note: null
      },
      now: {
        status: { en: 'Last signal: June 10, 2018. Mission over: Feb 13, 2019.', es: 'Última señal: 10 jun 2018. Misión terminada: 13 feb 2019.' },
        text: {
          en: 'Opportunity rests in Perseverance Valley, its solar panels covered in dust from the storm that silenced it. It was built for 90 days and 1 kilometer. It lasted almost 15 years and drove over 45 kilometers.',
          es: 'Opportunity descansa en el Valle de la Perseverancia, con sus paneles solares cubiertos del polvo de la tormenta que lo silenció. Fue construido para 90 días y 1 kilómetro. Duró casi 15 años y recorrió más de 45 kilómetros.'
        }
      },
      timeline: [
        { date: { en: 'Jul 7, 2003', es: '7 jul 2003' }, text: { en: 'Launches from Cape Canaveral, a few weeks after its twin, Spirit.', es: 'Despega desde Cabo Cañaveral, unas semanas después de su gemelo, Spirit.' } },
        { date: { en: 'Jan 24, 2004', es: '24 ene 2004' }, text: { en: 'Bounces down at least 26 times inside Eagle crater.', es: 'Rebota al menos 26 veces dentro del cráter Eagle.' } },
        { date: { en: '2005', es: '2005' }, text: { en: 'Stuck in sand; engineers take six weeks to free it.', es: 'Atrapado en la arena; los ingenieros tardan seis semanas en liberarlo.' } },
        { date: { en: '2007', es: '2007' }, text: { en: 'Huge dust storms; it waits about six weeks for the sky to clear.', es: 'Enormes tormentas de polvo; espera unas seis semanas a que se despeje el cielo.' } },
        { date: { en: '2010', es: '2010' }, text: { en: 'Breaks Viking 1\'s record as the longest-working spacecraft on Mars.', es: 'Supera el récord de la Viking 1 como la nave que más tiempo ha funcionado en Marte.' } },
        { date: { en: '2015', es: '2015' }, text: { en: 'Drives the distance of a full marathon on another world.', es: 'Recorre la distancia de un maratón completo en otro mundo.' } },
        { date: { en: '2017', es: '2017' }, text: { en: 'Drives into Perseverance Valley.', es: 'Entra en el Valle de la Perseverancia.' } },
        { date: { en: 'Jun 10, 2018', es: '10 jun 2018' }, text: { en: 'A planet-wide dust storm blocks the Sun. Last signal.', es: 'Una tormenta de polvo global tapa el Sol. Última señal.' } },
        { date: { en: 'Feb 13, 2019', es: '13 feb 2019' }, text: { en: 'NASA declares the mission over.', es: 'La NASA da por terminada la misión.' } }
      ],
      pages: [
        {
          title: { en: 'The Twin Rovers', es: 'Los vehículos gemelos' },
          text: {
            en: 'On July 7, 2003, a rocket carrying a robot called Opportunity launched from Cape Canaveral, Florida. Opportunity was a rover, a six-wheeled robot about the size of a golf cart, and it had a twin named Spirit, which was sent to the other side of Mars. Their mission was to study rocks and soil and look for clues that Mars once had water, and maybe even conditions where life could exist.\n\n' +
                'Opportunity was designed to last only 90 Martian days, or around three Earth months, and to travel only about 1 kilometer.',
            es: 'El 7 de julio de 2003, un cohete que transportaba un robot llamado Opportunity despegó desde Cabo Cañaveral, Florida. Opportunity era un vehículo explorador —un robot de seis ruedas, aproximadamente del tamaño de un carrito de golf— que contaba con un gemelo llamado Spirit, el cual fue enviado al otro lado de Marte. Su misión consistía en estudiar las rocas y el suelo, buscando indicios de que en Marte hubo agua en el pasado y, tal vez, incluso condiciones que permitieran la existencia de vida.\n\n' +
                'Opportunity fue diseñado para durar solo 90 días marcianos (unos tres meses terrestres) y para recorrer apenas un kilómetro.'
          }
        },
        {
          title: { en: 'Bouncing onto Mars', es: 'Un aterrizaje a rebotes en Marte' },
          text: {
            en: 'After six months in space, Opportunity finally reached Mars on January 24, 2004, just 20 days after Spirit did. It was wrapped in giant airbags, and when it hit the ground, it bounced at least 26 times before rolling to a stop in a flat area called Meridiani Planum, right inside a crater named Eagle. Incredible, right, reader?\n\n' +
                'Its landing site was named the Challenger Memorial Station, in honor of the crew of the Space Shuttle Challenger, lost in 1986.',
            es: 'Tras seis meses en el espacio, Opportunity llegó finalmente a Marte el 24 de enero de 2004, apenas 20 días después de la llegada de Spirit. El robot estaba envuelto en enormes bolsas de aire; al tocar la superficie, rebotó al menos 26 veces antes de detenerse en una zona llana llamada Meridiani Planum, justo dentro de un cráter bautizado como Eagle. ¡Increíble, ¿verdad, lector?!\n\n' +
                'El lugar de su aterrizaje fue denominado «Challenger Memorial Station», en honor a la tripulación del transbordador espacial Challenger, perdida en 1986.'
          }
        },
        {
          title: { en: 'Never Giving Up', es: 'Sin rendirse jamás' },
          text: {
            en: 'Opportunity\'s journey wasn\'t easy. In 2005, its wheels got stuck in sand, and it took engineers six weeks, moving it just a few centimeters at a time, to be able to free it. In 2007, massive dust storms covered Mars and blocked most of the sunlight that Opportunity needed for power, so it had to stop and wait about 6 weeks for the sky to clear. But it kept going, and by 2010, Opportunity had been working longer than any spacecraft on Mars, breaking the record set by Viking 1. Even its twin, Spirit, had already gone silent.\n\n' +
                'Now Opportunity was exploring alone.',
            es: 'El viaje de Opportunity no fue sencillo. En 2005, sus ruedas quedaron atrapadas en la arena; los ingenieros tardaron seis semanas en liberarlo, moviéndolo apenas unos centímetros cada vez. En 2007, unas gigantescas tormentas de polvo cubrieron Marte y bloquearon gran parte de la luz solar que Opportunity necesitaba para obtener energía, por lo que tuvo que detenerse y esperar unas seis semanas a que el cielo se despejara. Pero el robot siguió adelante y, para 2010, Opportunity ya había estado operando más tiempo que cualquier otra nave espacial en Marte, superando el récord establecido por la Viking 1. Incluso su gemelo, Spirit, ya había dejado de comunicarse.\n\n' +
                'Ahora, Opportunity exploraba en solitario.'
          }
        },
        {
          title: { en: 'Records and Memories', es: 'Récords y recuerdos' },
          text: {
            en: 'Opportunity kept impressing us as it kept breaking records, and in 2015, it became the first ever to travel the distance of a full marathon on another world. In 2016, it even climbed the steepest slope any rover had ever driven on Mars. Luckily, sometimes the wind would blow the dust off its solar panels, giving it new energy. Opportunity also carried a special memory: as a tribute to the victims, a small piece of its rock-grinding tool was made from aluminum recovered from the World Trade Center towers, which were destroyed on September 11, 2001.',
            es: 'Opportunity siguió sorprendiéndonos al batir récords constantemente; en 2015, se convirtió en el primer vehículo en recorrer la distancia de un maratón completo en otro mundo. En 2016, llegó incluso a ascender por la pendiente más pronunciada que cualquier vehículo explorador haya transitado jamás en Marte. Por fortuna, en ocasiones el viento eliminaba el polvo de sus paneles solares, proporcionándole nueva energía. Opportunity también portaba un recuerdo especial: como homenaje a las víctimas, una pequeña pieza de su herramienta para perforar rocas fue fabricada con aluminio recuperado de las torres del World Trade Center, destruidas el 11 de septiembre de 2001.'
          }
        },
        {
          title: { en: 'Perseverance Valley', es: 'Valle de la Perseverancia (Perseverance Valley)' },
          text: {
            en: 'In 2017, Opportunity drove into a gully called Perseverance Valley. Sadly, in June 2018, a very big dust storm covered the entire planet and blocked out the Sun. And, without any sunlight, Opportunity couldn\'t get power. Its last signal reached Earth on June 10, 2018. NASA kept trying to reach it for months, but Opportunity never answered back. Finally, on February 13, 2019, NASA declared the mission over.\n\n' +
                'Opportunity surprised everyone. It was supposed to only last 90 days, but instead it lasted almost 15 years, about 60 times longer than expected, and drove over 45 kilometers when it was made to only drive 1. Opportunity still rests in Perseverance Valley, the perfect name for a rover that never gave up and kept going against all odds.',
            es: 'En 2017, Opportunity se adentró en un barranco llamado Valle de la Perseverancia. Lamentablemente, en junio de 2018, una gigantesca tormenta de polvo cubrió el planeta entero y ocultó el Sol. Sin luz solar, Opportunity no pudo obtener energía. Su última señal llegó a la Tierra el 10 de junio de 2018. La NASA intentó establecer contacto durante meses, pero Opportunity nunca respondió. Finalmente, el 13 de febrero de 2019, la NASA dio por concluida la misión.\n\n' +
                'Opportunity sorprendió a todos. Aunque estaba diseñado para durar solo 90 días, permaneció activo durante casi 15 años —unas 60 veces más de lo previsto— y recorrió más de 45 kilómetros, a pesar de haber sido construido para cubrir apenas 1 kilómetro. Opportunity descansa todavía en el Valle de la Perseverancia; un nombre perfecto para un vehículo explorador que nunca se rindió y siguió adelante contra todo pronóstico.'
          }
        }
      ],
      art: {
        background: '1', // pre-filled on the coloring page
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

  /* ---------- Coloring page colors ----------
     The coloring page is built from each book's detailed 64x64 drawing.
     The sky, ground and black outlines come pre-colored; every spacecraft
     pixel is grouped into one of these crayons (numbered in this order).
     "match" lists the drawing's palette names (see js/sprites.js).       */

  var colorFamilies = [
    { color: '#f2f4f8', name: { en: 'White', es: 'Blanco' }, match: ['s0', 's1', 'm0', 'st0', 'st1'] },
    { color: '#b4bac8', name: { en: 'Light gray', es: 'Gris claro' }, match: ['s2', 'm1'] },
    { color: '#5c6378', name: { en: 'Dark gray', es: 'Gris oscuro' }, match: ['s3', 's4', 's5', 'm2', 'm3', 'm4', 'm5'] },
    { color: '#ffd23f', name: { en: 'Yellow', es: 'Amarillo' }, match: ['g0', 'g1'] },
    { color: '#d0861c', name: { en: 'Gold', es: 'Dorado' }, match: ['g2', 'g3', 'g4'] },
    { color: '#e0442c', name: { en: 'Red', es: 'Rojo' }, match: ['red', 'red2', 'r0', 'r1', 'r2', 'r3', 'r4', 'r5'] },
    { color: '#3f7fe0', name: { en: 'Blue', es: 'Azul' }, match: ['b0', 'b1', 'b2', 'b3', 'b4', 'e0', 'e1', 'e2', 'cyan', 'cyan2', 'st2'] },
    { color: '#58b865', name: { en: 'Green', es: 'Verde' }, match: ['eg', 'eg2'] },
    { color: '#d9a877', name: { en: 'Sand', es: 'Arena' }, match: ['k0', 'k1', 'k2', 'k3'] }
  ];

  /* ---------- Our Mission ----------
     Each section: h (heading) plus any of
       p     paragraph text
       links [{ label, url }]  (NASA sources)
       list  [{ b: bold lead-in, t: text }]                            */

  var mission = {
    sections: [
      {
        h: { en: 'Our goal', es: 'Nuestro objetivo' },
        p: {
          en: 'This page was created for the NASA Space Apps Challenge hackathon, with the purpose of informing teenagers and helping them understand the stories of these spacecraft in an easier and more entertaining way, so they can engage with the content and the narrator. At the end of each book, they have the opportunity to prove the knowledge they just gained by taking a fun, interactive quiz.',
          es: 'Esta página fue creada para el hackatón NASA Space Apps Challenge, con el propósito de informar a los adolescentes y ayudarlos a entender las historias de estas naves espaciales de una forma más fácil y entretenida, para que conecten con el contenido y con la narradora. Al final de cada libro, tienen la oportunidad de demostrar lo que acaban de aprender con un cuestionario divertido e interactivo.'
        }
      },
      {
        h: { en: 'Who is it for?', es: '¿Para quién es?' },
        p: {
          en: 'This was made for teenagers, to give them a more dynamic way to learn and inform themselves.',
          es: 'Está hecho para adolescentes, para darles una forma más dinámica de aprender e informarse.'
        }
      },
      {
        h: { en: 'NASA sources', es: 'Fuentes de la NASA' },
        links: [
          { label: { en: 'Apollo 11 (Eagle): NASA NSSDCA, Apollo 11 Lunar Module', es: 'Apolo 11 (Eagle): NASA NSSDCA, módulo lunar del Apolo 11' }, url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C' },
          { label: { en: 'GRAIL (Ebb and Flow): NASA Science, GRAIL mission page', es: 'GRAIL (Ebb y Flow): NASA Science, página de la misión GRAIL' }, url: 'https://science.nasa.gov/mission/grail/' },
          { label: { en: 'Viking 1: NASA NSSDCA, Viking Mission to Mars', es: 'Viking 1: NASA NSSDCA, misión Viking a Marte' }, url: 'https://nssdc.gsfc.nasa.gov/planetary/viking.html' },
          { label: { en: 'Opportunity: NASA Science, Mars Exploration Rover Opportunity (MER-B)', es: 'Opportunity: NASA Science, Mars Exploration Rover Opportunity (MER-B)' }, url: 'https://science.nasa.gov/mission/mer-opportunity/' }
        ]
      },
      {
        h: { en: 'Our team', es: 'Nuestro equipo' },
        p: {
          en: 'We are Camila and Alejandra, twins who are very passionate about technology, about innovating with it, and about using AI as a tool to help us make the world better.',
          es: 'Somos Camila y Alejandra, gemelas apasionadas por la tecnología, por innovar con ella y por usar la IA como una herramienta que nos ayude a hacer del mundo un lugar mejor.'
        }
      },
      {
        h: { en: 'How we used AI', es: 'Cómo usamos la IA' },
        p: {
          en: 'This project used Claude (Anthropic) as a writing and coding assistant throughout the hackathon. Specifically:',
          es: 'Este proyecto usó Claude (Anthropic) como asistente de escritura y programación durante todo el hackatón. En concreto:'
        },
        list: [
          {
            b: { en: 'Research simplification:', es: 'Simplificación de la investigación:' },
            t: { en: 'We provided Claude with official NASA mission data (from NSSDC and science.nasa.gov) for each spacecraft. Claude helped translate the technical language into simpler explanations that we could understand and use as a factual foundation.',
                 es: 'Le dimos a Claude datos oficiales de la NASA (de NSSDC y science.nasa.gov) sobre cada nave. Claude nos ayudó a convertir el lenguaje técnico en explicaciones más sencillas que pudiéramos entender y usar como base de los hechos.' }
          },
          {
            b: { en: 'Story writing:', es: 'Escritura de las historias:' },
            t: { en: 'All five-page stories for each book were written by us, in our own words and in Camila\'s voice. Claude reviewed our drafts for grammar, clarity, and factual accuracy against the NASA sources, and suggested small edits. The creative choices, tone, and storytelling were ours.',
                 es: 'Todas las historias de cinco páginas de cada libro las escribimos nosotras, con nuestras propias palabras y con la voz de Camila. Claude revisó nuestros borradores en cuanto a gramática, claridad y exactitud según las fuentes de la NASA, y sugirió pequeñas correcciones. Las decisiones creativas, el tono y la forma de contar fueron nuestros.' }
          },
          {
            b: { en: 'Narration:', es: 'Narración:' },
            t: { en: 'All audio narration, in both English and Spanish, was recorded by Camila herself. No AI-generated voices were used.',
                 es: 'Toda la narración en audio, en inglés y en español, la grabó Camila personalmente. No se usaron voces generadas por IA.' }
          },
          {
            b: { en: 'Translation:', es: 'Traducción:' },
            t: { en: 'The Spanish versions of the stories were translated with Google Translate, then reviewed and adjusted by us, as native Spanish speakers, so they sound natural. Claude helped translate the "Our mission" page into Spanish.',
                 es: 'Las versiones en español de las historias se tradujeron con Google Translate y luego las revisamos y ajustamos nosotras, como hablantes nativas de español, para que sonaran naturales. Claude ayudó a traducir al español la página «Nuestra misión».' }
          },
          {
            b: { en: 'Website development:', es: 'Desarrollo del sitio web:' },
            t: { en: 'Claude (via Claude Code) helped write the HTML, CSS, and JavaScript code for the website\'s structure, visuals, and interactive features (book reader, quiz, graveyard map), based on our design direction and content.',
                 es: 'Claude (a través de Claude Code) ayudó a escribir el código HTML, CSS y JavaScript de la estructura, los elementos visuales y las funciones interactivas del sitio (lector de libros, cuestionario, mapa del cementerio), siguiendo nuestra dirección de diseño y nuestro contenido.' }
          },
          {
            b: { en: 'Interface translations:', es: 'Traducción de la interfaz:' },
            t: { en: 'Small UI text (buttons, labels, menu items) was translated by Claude and reviewed by us.',
                 es: 'Los textos cortos de la interfaz (botones, etiquetas, menús) los tradujo Claude y los revisamos nosotras.' }
          },
          {
            b: { en: 'Pixel art:', es: 'Pixel art:' },
            t: { en: 'The spacecraft illustrations (on their missions and as they look today), the coloring pages, and the Moon and Mars maps were drawn by Claude in code, following our retro pixel-art style direction.',
                 es: 'Las ilustraciones de las naves (en su misión y como se ven hoy), las páginas para colorear y los mapas de la Luna y de Marte los dibujó Claude con código, siguiendo nuestra dirección de estilo pixel art retro.' }
          },
          {
            b: { en: '"Where are they now?" texts:', es: 'Textos de «¿Dónde están ahora?»:' },
            t: { en: 'The timelines and the "today" descriptions for each spacecraft were drafted by Claude from our stories and NASA mission dates, and reviewed by us.',
                 es: 'Las líneas del tiempo y las descripciones de «hoy» de cada nave las redactó Claude a partir de nuestras historias y de las fechas de las misiones de la NASA, y las revisamos nosotras.' }
          }
        ]
      }
    ]
  };

  window.ABNF_DATA = { ui: ui, books: books, mission: mission, colorFamilies: colorFamilies };
})();
