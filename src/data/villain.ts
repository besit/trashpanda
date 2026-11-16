// The antagonist's name, in one place (M3.3: renamed from the working name; the character is a fictional
// cartoon bulldog, a parody of a type of politician, not a depiction of any real person).
export const VILLAIN = 'DOG FJORD';

/** the satire + AI notice shown under ABOUT on the title screen, in the credits and in the README */
export const DISCLAIMER_LINES = [
  `TRASH PANDA: RIGHT OF WAY IS A WORK OF SATIRE AND PARODY. ${VILLAIN} AND HIS RATS ARE FICTIONAL CARTOON CHARACTERS. NOTHING THEY SAY OR DO IS A STATEMENT OF FACT ABOUT ANY REAL PERSON.`,
  '',
  "THE GAME'S FACTS ABOUT TORONTO'S STREETS AND POLICIES ARE SOURCED (SEE SOURCES). ANYTHING INVENTED IS LABELLED AS FICTION.",
  '',
  'THIS GAME WAS MADE WITH THE HELP OF AI (CLAUDE, BY ANTHROPIC). AI CAN MAKE MISTAKES. IF YOU SPOT ONE, PLEASE TELL US.',
];

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
  'CODE, PIXEL ART, CHIPTUNE AND RESEARCH: CLAUDE (ANTHROPIC)',
  '',
  'BUILT WITH PHASER 3, TYPESCRIPT AND VITE. EVERY SPRITE, TILE, SONG AND SOUND IS ORIGINAL AND GENERATED FROM CODE.',
  '',
];
/** the clickable rows under the credits */
export const CREDIT_LINKS = [LINKS.instagram, LINKS.x, LINKS.repo];
