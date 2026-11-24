// The antagonist's name, in one place (M3.3: renamed from the working name; the character is a fictional
// cartoon bulldog, a parody of a type of politician, not a depiction of any real person).
export const VILLAIN = 'DOG FJORD';

/** the satire + AI notice shown under ABOUT on the title screen, in the credits and in the README */
export const DISCLAIMER_LINES = [
  `TRASH PANDA: RIGHT OF WAY IS A WORK OF SATIRE AND PARODY. ${VILLAIN} AND HIS RATS ARE FICTIONAL CARTOON CHARACTERS. NOTHING THEY SAY OR DO IS A STATEMENT OF FACT ABOUT ANY REAL PERSON.`,
  '',
  // M4.17 (Ivan: "anything invented is labelled as fiction" could read as "everything else is true")
  "WE TRIED TO BACK EVERY FACT ABOUT TORONTO'S STREETS AND POLICIES WITH A SOURCE (SEE SOURCES), AND TO MARK WHAT WE MADE UP AS FICTION. IF SOMETHING ISN'T MARKED, THAT DOESN'T MAKE IT TRUE: CHECK THE SOURCES.",
  '',
  'THIS GAME WAS MADE WITH THE HELP OF AI: CLAUDE (ANTHROPIC), GEMINI (GOOGLE) AND QWEN-IMAGE-EDIT (ALIBABA). AI CAN MAKE MISTAKES. IF YOU SPOT ONE, PLEASE TELL US.',
];

/** 1.0: what the play counter sends (shown under ABOUT; core/Telemetry.ts) */
export const PRIVACY_LINE = 'NO ADS, NO COOKIES. PLAYS AND MINUTES PLAYED ARE COUNTED ANONYMOUSLY; DO NOT TRACK TURNS IT OFF.';

/** M4.1 (Ivan): the alias, not the real name, and the socials (clickable under ABOUT > CREDITS) */
export const AUTHOR_ALIAS = 'SEXWITHAWHALEINC';
export const LINKS = {
  instagram: { label: 'INSTAGRAM: @SEXWITHAWHALEINC', url: 'https://www.instagram.com/sexwithawhaleinc/' },
  x: { label: 'X: @SEXWITHAWHALE', url: 'https://x.com/sexwithawhale' },
  repo: { label: 'GITHUB.COM/BESIT/TRASHPANDA', url: 'https://github.com/besit/trashpanda' },
  research: { label: 'ALL SOURCES: DOCS/URBAN_RESEARCH.MD', url: 'https://github.com/besit/trashpanda/blob/main/docs/URBAN_RESEARCH.md' },
  game: { label: 'BESIT.GITHUB.IO/TRASHPANDA', url: 'https://besit.github.io/trashpanda/' },
} as const;

export const CREDITS_LINES = [
  `DESIGN, DIRECTION AND REVIEW: ${AUTHOR_ALIAS}`,
  // M4.17 (Ivan): who built what, with which AI
  'CODE, MOST PIXEL ART, MUSIC, RESEARCH: CLAUDE (ANTHROPIC)',
  'HERO ART: GEMINI (GOOGLE) + QWEN-IMAGE-EDIT (ALIBABA)',
  '',
  'MADE WITH PHASER 3, TYPESCRIPT AND VITE. THE MUSIC IS SYNTHESIZED IN YOUR BROWSER.',
  '',
];
/** the clickable rows under the credits */
export const CREDIT_LINKS = [LINKS.instagram, LINKS.x, LINKS.repo];
