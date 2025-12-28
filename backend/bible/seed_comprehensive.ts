import { api, APIError } from "encore.dev/api";
import db from "../db";

interface SeedRequest {
  passcode: string;
}

interface SeedResponse {
  seeded: number;
}

export const seedComprehensiveBibleData = api<SeedRequest, SeedResponse>(
  { expose: true, method: "POST", path: "/bible/seed/comprehensive", auth: false },
  async (req) => {
    if (req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }

    // Comprehensive seed data for popular chapters
    const bibleData = {
      kjv: {
        "john": {
          3: [
            "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:",
            "The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him.",
            "Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.",
            "Nicodemus saith unto him, How can a man be born when he is old? can he enter the second time into his mother's womb, and be born?",
            "Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God.",
            "That which is born of the flesh is flesh; and that which is born of the Spirit is spirit.",
            "Marvel not that I said unto thee, Ye must be born again.",
            "The wind bloweth where it listeth, and thou hearest the sound thereof, but canst not tell whence it cometh, and whither it goeth: so is every one that is born of the Spirit.",
            "Nicodemus answered and said unto him, How can these things be?",
            "Jesus answered and said unto him, Art thou a master of Israel, and knowest not these things?",
            "Verily, verily, I say unto thee, We speak that we do know, and testify that we have seen; and ye receive not our witness.",
            "If I have told you earthly things, and ye believe not, how shall ye believe, if I tell you of heavenly things?",
            "And no man hath ascended up to heaven, but he that came down from heaven, even the Son of man which is in heaven.",
            "And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up:",
            "That whosoever believeth in him should not perish, but have everlasting life.",
            "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
            "For God sent not his Son into the world to condemn the world; but that the world through him might be saved.",
            "He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.",
            "And this is the condemnation, that light is come into the world, and men loved darkness rather than light, because their deeds were evil.",
            "For every one that doeth evil hateth the light, neither cometh to the light, lest his deeds should be reproved.",
            "But he that doeth truth cometh to the light, that his deeds may be made manifest, that they are wrought in God."
          ],
          1: [
            "In the beginning was the Word, and the Word was with God, and the Word was God.",
            "The same was in the beginning with God.",
            "All things were made by him; and without him was not any thing made that was made.",
            "In him was life; and the life was the light of men.",
            "And the light shineth in darkness; and the darkness comprehended it not.",
            "There was a man sent from God, whose name was John.",
            "The same came for a witness, to bear witness of the Light, that all men through him might believe.",
            "He was not that Light, but was sent to bear witness of that Light.",
            "That was the true Light, which lighteth every man that cometh into the world.",
            "He was in the world, and the world was made by him, and the world knew him not.",
            "He came unto his own, and his own received him not.",
            "But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name:",
            "Which were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God.",
            "And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.",
            "John bare witness of him, and cried, saying, This was he of whom I spake, He that cometh after me is preferred before me: for he was before me.",
            "And of his fulness have all we received, and grace for grace.",
            "For the law was given by Moses, but grace and truth came by Jesus Christ.",
            "No man hath seen God at any time; the only begotten Son, which is in the bosom of the Father, he hath declared him."
          ]
        },
        "genesis": {
          1: [
            "In the beginning God created the heaven and the earth.",
            "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.",
            "And God said, Let there be light: and there was light.",
            "And God saw the light, that it was good: and God divided the light from the darkness.",
            "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.",
            "And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters.",
            "And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so.",
            "And God called the firmament Heaven. And the evening and the morning were the second day.",
            "And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so.",
            "And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good.",
            "And God said, Let the earth bring forth grass, the herb yielding seed, and the fruit tree yielding fruit after his kind, whose seed is in itself, upon the earth: and it was so.",
            "And the earth brought forth grass, and herb yielding seed after his kind, and the tree yielding fruit, whose seed was in itself, after his kind: and God saw that it was good.",
            "And the evening and the morning were the third day."
          ]
        },
        "psalms": {
          23: [
            "The LORD is my shepherd; I shall not want.",
            "He maketh me to lie down in green pastures: he leadeth me beside the still waters.",
            "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.",
            "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.",
            "Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.",
            "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever."
          ],
          91: [
            "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.",
            "I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust.",
            "Surely he shall deliver thee from the snare of the fowler, and from the noisome pestilence.",
            "He shall cover thee with his feathers, and under his wings shalt thou trust: his truth shall be thy shield and buckler.",
            "Thou shalt not be afraid for the terror by night; nor for the arrow that flieth by day;",
            "Nor for the pestilence that walketh in darkness; nor for the destruction that wasteth at noonday.",
            "A thousand shall fall at thy side, and ten thousand at thy right hand; but it shall not come nigh thee.",
            "Only with thine eyes shalt thou behold and see the reward of the wicked.",
            "Because thou hast made the LORD, which is my refuge, even the most High, thy habitation;",
            "There shall no evil befall thee, neither shall any plague come nigh thy dwelling.",
            "For he shall give his angels charge over thee, to keep thee in all thy ways.",
            "They shall bear thee up in their hands, lest thou dash thy foot against a stone.",
            "Thou shalt tread upon the lion and adder: the young lion and the dragon shalt thou trample under feet.",
            "Because he hath set his love upon me, therefore will I deliver him: I will set him on high, because he hath known my name.",
            "He shall call upon me, and I will answer him: I will be with him in trouble; I will deliver him, and honour him.",
            "With long life will I satisfy him, and shew him my salvation."
          ]
        },
        "matthew": {
          5: [
            "And seeing the multitudes, he went up into a mountain: and when he was set, his disciples came unto him:",
            "And he opened his mouth, and taught them, saying,",
            "Blessed are the poor in spirit: for theirs is the kingdom of heaven.",
            "Blessed are they that mourn: for they shall be comforted.",
            "Blessed are the meek: for they shall inherit the earth.",
            "Blessed are they which do hunger and thirst after righteousness: for they shall be filled.",
            "Blessed are the merciful: for they shall obtain mercy.",
            "Blessed are the pure in heart: for they shall see God.",
            "Blessed are the peacemakers: for they shall be called the children of God.",
            "Blessed are they which are persecuted for righteousness' sake: for theirs is the kingdom of heaven.",
            "Blessed are ye, when men shall revile you, and persecute you, and shall say all manner of evil against you falsely, for my sake.",
            "Rejoice, and be exceeding glad: for great is your reward in heaven: for so persecuted they the prophets which were before you.",
            "Ye are the salt of the earth: but if the salt have lost his savour, wherewith shall it be salted? it is thenceforth good for nothing, but to be cast out, and to be trodden under foot of men.",
            "Ye are the light of the world. A city that is set on an hill cannot be hid.",
            "Neither do men light a candle, and put it under a bushel, but on a candlestick; and it giveth light unto all that are in the house.",
            "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven."
          ]
        }
      },
      rv1909: {
        "juan": {
          3: [
            "Había un hombre de los Fariseos, llamado Nicodemo, príncipe de los Judíos.",
            "Este vino a Jesús de noche, y le dijo: Rabí, sabemos que has venido de Dios por maestro; porque nadie puede hacer estas señales que tú haces, si no estuviere Dios con él.",
            "Respondió Jesús y le dijo: De cierto, de cierto te digo, que el que no naciere de nuevo, no puede ver el reino de Dios.",
            "Nicodemo le dijo: ¿Cómo puede el hombre nacer siendo viejo? ¿Puede entrar otra vez en el vientre de su madre, y nacer?",
            "Respondió Jesús: De cierto, de cierto te digo, que el que no naciere de agua y del Espíritu, no puede entrar en el reino de Dios.",
            "Lo que es nacido de la carne, carne es; y lo que es nacido del Espíritu, espíritu es.",
            "No te maravilles de que te dije: Os es necesario nacer de nuevo.",
            "El viento sopla de donde quiere, y oyes su sonido; mas ni sabes de dónde viene, ni a dónde vaya: así es todo aquel que es nacido del Espíritu.",
            "Respondió Nicodemo y le dijo: ¿Cómo puede hacerse esto?",
            "Respondió Jesús y le dijo: ¿Tú eres maestro de Israel, y no sabes esto?",
            "De cierto, de cierto te digo, que hablamos lo que sabemos, y testificamos lo que hemos visto; y no recibís nuestro testimonio.",
            "Si os he dicho cosas terrenas, y no creéis, ¿creeréis si os dijere las celestiales?",
            "Y nadie subió al cielo, sino el que descendió del cielo, el Hijo del hombre, que está en el cielo.",
            "Y como Moisés levantó la serpiente en el desierto, así es necesario que el Hijo del Hombre sea levantado:",
            "Para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
            "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
            "Porque no envió Dios a su Hijo al mundo para que condene al mundo, mas para que el mundo sea salvo por él.",
            "El que en él cree, no es condenado; pero el que no cree, ya es condenado, porque no ha creído en el nombre del unigénito Hijo de Dios.",
            "Y esta es la condenación: que la luz vino al mundo, y los hombres amaron más las tinieblas que la luz, porque sus obras eran malas.",
            "Porque todo aquel que hace lo malo, aborrece la luz, y no viene a la luz, para que sus obras no sean reprendidas.",
            "Mas el que hace verdad, viene a la luz, para que sus obras sean manifestadas, que son hechas en Dios."
          ]
        },
        "salmos": {
          23: [
            "Jehová es mi pastor; nada me faltará.",
            "En lugares de delicados pastos me hará descansar: Junto a aguas de reposo me pastoreará.",
            "Confortará mi alma; Me guiará por sendas de justicia por amor de su nombre.",
            "Aunque ande en valle de sombra de muerte, No temeré mal alguno, porque tú estarás conmigo; Tu vara y tu cayado me consolarán.",
            "Aderezas mesa delante de mí en presencia de mis angustiadores; Unges mi cabeza con aceite, mi copa está llena.",
            "Ciertamente el bien y la misericordia me seguirán todos los días de mi vida: Y habitaré en la casa de Jehová por largos días."
          ]
        }
      },
      spnbes: {
        "juan": {
          3: [
            "Había un fariseo llamado Nicodemo, un autoridad judía.",
            "Él vino de noche a Jesús y le dijo: —Rabí, sabemos que tú eres un maestro que ha venido de parte de Dios, porque nadie puede hacer las señales que tú haces si Dios no está con él.",
            "Jesús le respondió: —En verdad te digo que, si uno no nace de nuevo, no puede ver el reino de Dios.",
            "Nicodemo le preguntó: —¿Cómo puede uno nacer siendo ya viejo? ¿Acaso puede entrar por segunda vez en el vientre de su madre y nacer?",
            "Jesús respondió: —En verdad te digo que, si uno no nace de agua y del Espíritu, no puede entrar en el reino de Dios.",
            "Lo que nace de la carne, es carne; y lo que nace del Espíritu, es Espíritu.",
            "No te sorprendas de que te haya dicho: 'Tienen que nacer de nuevo'.",
            "El viento sopla donde quiere y oyes su silbido, pero no sabes de dónde viene ni a dónde va. Así pasa con todos los que nacen del Espíritu.",
            "Nicodemo le preguntó: —¿Cómo puede suceder esto?",
            "Jesús le respondió: —Tú eres maestro de Israel, ¿y no entiendes estas cosas?",
            "Te aseguro que hablamos de lo que sabemos y damos testimonio de lo que hemos visto, pero ustedes no aceptan nuestro testimonio.",
            "Si les he hablado de cosas terrenales y no creen, ¿cómo creerán si les hablo de cosas celestiales?",
            "Nadie ha subido al cielo sino el que descendió del cielo, el Hijo del hombre.",
            "Así como Moisés levantó la serpiente en el desierto, así también tiene que ser levantado el Hijo del hombre,",
            "para que todo el que crea en él tenga vida eterna.",
            "Porque tanto amó Dios al mundo, que dio a su Hijo único, para que todo el que cree en él no se pierda, sino que tenga vida eterna.",
            "Dios no envió a su Hijo al mundo para condenar al mundo, sino para que el mundo se salve por medio de él.",
            "El que cree en él no es condenado, pero el que no cree ya está condenado, porque no ha creído en el nombre del Hijo único de Dios.",
            "Y esta es la condenación: que la luz vino al mundo, pero la gente prefirió la oscuridad a la luz porque sus obras eran malas.",
            "Quien hace lo malo odia la luz y no se acerca a ella para que sus obras no sean descubiertas.",
            "Pero el que practica la verdad se acerca a la luz, para que se vea claramente que sus obras son hechas en Dios."
          ]
        },
        "salmos": {
          23: [
            "El Señor es mi pastor; nada me falta.",
            "En verdes pastos me hace descansar. Junto a tranquilas aguas me conduce.",
            "Él restaura mi alma. Me guía por sendas de justicia por amor a su nombre.",
            "Aunque pase por el valle más oscuro, no temeré peligro alguno, porque tú estás conmigo; tu vara y tu cayado me consuelan.",
            "Preparas una mesa para mí frente a mis enemigos. Unges mi cabeza con perfume; mi copa rebosa.",
            "Tu bondad y tu amor me seguirán todos los días de mi vida, y en la casa del Señor viviré por siempre."
          ]
        }
      }
    };

    let total = 0;

    for (const [translation, books] of Object.entries(bibleData)) {
      for (const [book, chapters] of Object.entries(books)) {
        for (const [chapterNum, verses] of Object.entries(chapters)) {
          const verseArray = verses as string[];
          for (const [verseNum, text] of verseArray.entries()) {
            await db.exec`
              INSERT INTO bible_verses (translation, book, chapter, verse, text)
              VALUES (${translation}, ${book}, ${parseInt(chapterNum)}, ${verseNum + 1}, ${text})
              ON CONFLICT (translation, book, chapter, verse)
              DO UPDATE SET text = EXCLUDED.text
            `;
            total++;
          }
        }
      }
    }

    return { seeded: total };
  }
);
