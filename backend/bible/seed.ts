import { api, APIError } from "encore.dev/api";
import db from "../db";

interface SeedRequest {
  passcode: string;
}

interface SeedResponse {
  seeded: number;
}

export const seedBibleData = api<SeedRequest, SeedResponse>(
  { expose: true, method: "POST", path: "/bible/seed", auth: false },
  async (req) => {
    if (req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }

    // Seed comprehensive Bible data for popular chapters
    const verses = [
      // John 3 (full chapter - KJV)
      { book: "john", chapter: 3, verse: 1, text: "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:" },
      { book: "john", chapter: 3, verse: 2, text: "The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him." },
      { book: "john", chapter: 3, verse: 3, text: "Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God." },
      { book: "john", chapter: 3, verse: 4, text: "Nicodemus saith unto him, How can a man be born when he is old? can he enter the second time into his mother's womb, and be born?" },
      { book: "john", chapter: 3, verse: 5, text: "Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God." },
      { book: "john", chapter: 3, verse: 6, text: "That which is born of the flesh is flesh; and that which is born of the Spirit is spirit." },
      { book: "john", chapter: 3, verse: 7, text: "Marvel not that I said unto thee, Ye must be born again." },
      { book: "john", chapter: 3, verse: 8, text: "The wind bloweth where it listeth, and thou hearest the sound thereof, but canst not tell whence it cometh, and whither it goeth: so is every one that is born of the Spirit." },
      { book: "john", chapter: 3, verse: 9, text: "Nicodemus answered and said unto him, How can these things be?" },
      { book: "john", chapter: 3, verse: 10, text: "Jesus answered and said unto him, Art thou a master of Israel, and knowest not these things?" },
      { book: "john", chapter: 3, verse: 11, text: "Verily, verily, I say unto thee, We speak that we do know, and testify that we have seen; and ye receive not our witness." },
      { book: "john", chapter: 3, verse: 12, text: "If I have told you earthly things, and ye believe not, how shall ye believe, if I tell you of heavenly things?" },
      { book: "john", chapter: 3, verse: 13, text: "And no man hath ascended up to heaven, but he that came down from heaven, even the Son of man which is in heaven." },
      { book: "john", chapter: 3, verse: 14, text: "And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up:" },
      { book: "john", chapter: 3, verse: 15, text: "That whosoever believeth in him should not perish, but have everlasting life." },
      { book: "john", chapter: 3, verse: 16, text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
      { book: "john", chapter: 3, verse: 17, text: "For God sent not his Son into the world to condemn the world; but that the world through him might be saved." },
      { book: "john", chapter: 3, verse: 18, text: "He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God." },
      { book: "john", chapter: 3, verse: 19, text: "And this is the condemnation, that light is come into the world, and men loved darkness rather than light, because their deeds were evil." },
      { book: "john", chapter: 3, verse: 20, text: "For every one that doeth evil hateth the light, neither cometh to the light, lest his deeds should be reproved." },
      { book: "john", chapter: 3, verse: 21, text: "But he that doeth truth cometh to the light, that his deeds may be made manifest, that they are wrought in God." },
      
      // Genesis 1 (first 13 verses - KJV)
      { book: "genesis", chapter: 1, verse: 1, text: "In the beginning God created the heaven and the earth." },
      { book: "genesis", chapter: 1, verse: 2, text: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters." },
      { book: "genesis", chapter: 1, verse: 3, text: "And God said, Let there be light: and there was light." },
      { book: "genesis", chapter: 1, verse: 4, text: "And God saw the light, that it was good: and God divided the light from the darkness." },
      { book: "genesis", chapter: 1, verse: 5, text: "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day." },
      { book: "genesis", chapter: 1, verse: 6, text: "And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters." },
      { book: "genesis", chapter: 1, verse: 7, text: "And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so." },
      { book: "genesis", chapter: 1, verse: 8, text: "And God called the firmament Heaven. And the evening and the morning were the second day." },
      { book: "genesis", chapter: 1, verse: 9, text: "And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so." },
      { book: "genesis", chapter: 1, verse: 10, text: "And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good." },
      { book: "genesis", chapter: 1, verse: 11, text: "And God said, Let the earth bring forth grass, the herb yielding seed, and the fruit tree yielding fruit after his kind, whose seed is in itself, upon the earth: and it was so." },
      { book: "genesis", chapter: 1, verse: 12, text: "And the earth brought forth grass, and herb yielding seed after his kind, and the tree yielding fruit, whose seed was in itself, after his kind: and God saw that it was good." },
      { book: "genesis", chapter: 1, verse: 13, text: "And the evening and the morning were the third day." },
      
      // Psalm 23 (full chapter - KJV)
      { book: "psalms", chapter: 23, verse: 1, text: "The LORD is my shepherd; I shall not want." },
      { book: "psalms", chapter: 23, verse: 2, text: "He maketh me to lie down in green pastures: he leadeth me beside the still waters." },
      { book: "psalms", chapter: 23, verse: 3, text: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake." },
      { book: "psalms", chapter: 23, verse: 4, text: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me." },
      { book: "psalms", chapter: 23, verse: 5, text: "Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over." },
      { book: "psalms", chapter: 23, verse: 6, text: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever." },
      
      // Matthew 5 (Beatitudes - KJV)
      { book: "matthew", chapter: 5, verse: 1, text: "And seeing the multitudes, he went up into a mountain: and when he was set, his disciples came unto him:" },
      { book: "matthew", chapter: 5, verse: 2, text: "And he opened his mouth, and taught them, saying," },
      { book: "matthew", chapter: 5, verse: 3, text: "Blessed are the poor in spirit: for theirs is the kingdom of heaven." },
      { book: "matthew", chapter: 5, verse: 4, text: "Blessed are they that mourn: for they shall be comforted." },
      { book: "matthew", chapter: 5, verse: 5, text: "Blessed are the meek: for they shall inherit the earth." },
      { book: "matthew", chapter: 5, verse: 6, text: "Blessed are they which do hunger and thirst after righteousness: for they shall be filled." },
      { book: "matthew", chapter: 5, verse: 7, text: "Blessed are the merciful: for they shall obtain mercy." },
      { book: "matthew", chapter: 5, verse: 8, text: "Blessed are the pure in heart: for they shall see God." },
      { book: "matthew", chapter: 5, verse: 9, text: "Blessed are the peacemakers: for they shall be called the children of God." },
      { book: "matthew", chapter: 5, verse: 10, text: "Blessed are they which are persecuted for righteousness' sake: for theirs is the kingdom of heaven." },
      { book: "matthew", chapter: 5, verse: 11, text: "Blessed are ye, when men shall revile you, and persecute you, and shall say all manner of evil against you falsely, for my sake." },
      { book: "matthew", chapter: 5, verse: 12, text: "Rejoice, and be exceeding glad: for great is your reward in heaven: for so persecuted they the prophets which were before you." },
    ];

    let total = 0;

    for (const translation of ["kjv", "rv1909", "spnbes"]) {
      for (const v of verses) {
        await db.exec`
          INSERT INTO bible_verses (translation, book, chapter, verse, text)
          VALUES (${translation}, ${v.book}, ${v.chapter}, ${v.verse}, ${v.text})
          ON CONFLICT (translation, book, chapter, verse)
          DO UPDATE SET text = EXCLUDED.text
        `;
        total++;
      }
    }

    return { seeded: total };
  }
);
