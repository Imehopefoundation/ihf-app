/** A small rotating set of KJV verses for the "verse of the day". KJV only. */
export interface Verse {
  text: string;
  reference: string;
}

export const VERSES: Verse[] = [
  { text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.", reference: "Matthew 6:33 (KJV)" },
  { text: "I can do all things through Christ which strengtheneth me.", reference: "Philippians 4:13 (KJV)" },
  { text: "The soul of the diligent shall be made fat.", reference: "Proverbs 13:4 (KJV)" },
  { text: "The integrity of the upright shall guide them.", reference: "Proverbs 11:3 (KJV)" },
  { text: "Be kindly affectioned one to another with brotherly love; in honour preferring one another.", reference: "Romans 12:10 (KJV)" },
  { text: "He that is faithful in that which is least is faithful also in much.", reference: "Luke 16:10 (KJV)" },
  { text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.", reference: "Jeremiah 29:11 (KJV)" },
  { text: "Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.", reference: "Joshua 1:9 (KJV)" },
  { text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.", reference: "Isaiah 40:31 (KJV)" },
  { text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.", reference: "Proverbs 3:5 (KJV)" },
  { text: "And whatsoever ye do, do it heartily, as to the Lord, and not unto men.", reference: "Colossians 3:23 (KJV)" },
  { text: "The same commit thou to faithful men, who shall be able to teach others also.", reference: "2 Timothy 2:2 (KJV)" },
  { text: "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.", reference: "Matthew 5:16 (KJV)" },
  { text: "Train up a child in the way he should go: and when he is old, he will not depart from it.", reference: "Proverbs 22:6 (KJV)" },
];

/** Deterministic verse for a given day, so everyone sees the same one. */
export function verseOfTheDay(now: Date = new Date()): Verse {
  const dayNumber = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86_400_000,
  );
  return VERSES[((dayNumber % VERSES.length) + VERSES.length) % VERSES.length];
}
