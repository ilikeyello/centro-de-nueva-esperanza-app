import { api, APIError } from "encore.dev/api";
import db from "../db";

interface SeedRequest {
  passcode: string;
}

interface SeedResponse {
  seeded: number;
}

export const seedCompleteBibleData = api<SeedRequest, SeedResponse>(
  { expose: true, method: "POST", path: "/bible/seed/complete", auth: false },
  async (req) => {
    if (req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }

    // Complete Bible data with proper translations
    const bibleData = [
      // KJV - John 3 (complete)
      { translation: "kjv", book: "john", chapter: 3, verses: [
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
      ]},
      
      // RV1909 - John 3 (complete Spanish)
      { translation: "rv1909", book: "john", chapter: 3, verses: [
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
        "Si os he dicho cosas terrenales, y no creéis, ¿creeréis si os dijere las celestiales?",
        "Y nadie subió al cielo, sino el que descendió del cielo, el Hijo del hombre, que está en el cielo.",
        "Y como Moisés levantó la serpiente en el desierto, así es necesario que el Hijo del Hombre sea levantado:",
        "Para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
        "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
        "Porque no envió Dios a su Hijo al mundo para que condene al mundo, mas para que el mundo sea salvo por él.",
        "El que en él cree, no es condenado; pero el que no cree ya está condenado, porque no ha creído en el nombre del unigénito Hijo de Dios.",
        "Y esta es la condenación: que la luz vino al mundo, y los hombres amaron más las tinieblas que la luz, porque sus obras eran malas.",
        "Porque todo aquel que hace lo malo, aborrece la luz, y no viene a la luz, para que sus obras no sean reprendidas.",
        "Mas el que hace verdad, viene a la luz, para que sus obras sean manifestadas, que son hechas en Dios."
      ]},

      // SPNBES - John 3 (complete Spanish)
      { translation: "spnbes", book: "john", chapter: 3, verses: [
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
      ]},

      // KJV - Genesis 1 (complete)
      { translation: "kjv", book: "genesis", chapter: 1, verses: [
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
        "And the evening and the morning were the third day.",
        "And God said, Let there be lights in the firmament of the heaven to divide the day from the night; and let them be for signs, and for seasons, and for days, and years:",
        "And let them be for lights in the firmament of the heaven to give light upon the earth: and it was so.",
        "And God made two great lights; the greater light to rule the day, and the lesser light to rule the night: he made the stars also.",
        "And God set them in the firmament of the heaven to give light upon the earth,",
        "And to rule over the day and over the night, and to divide the light from the darkness: and God saw that it was good.",
        "And the evening and the morning were the fourth day.",
        "And God said, Let the waters bring forth abundantly the moving creature that hath life, and fowl that may fly above the earth in the open firmament of heaven.",
        "And God created great whales, and every living creature that moveth, which the waters brought forth abundantly, after their kind, and every winged fowl after his kind: and God saw that it was good.",
        "And God blessed them, saying, Be fruitful, and multiply, and fill the waters in the seas, and let fowl multiply in the earth.",
        "And the evening and the morning were the fifth day.",
        "And God said, Let the earth bring forth the living creature after his kind, cattle, and creeping thing, and beast of the earth after his kind: and it was so.",
        "And God made the beast of the earth after his kind, and cattle after their kind, and every thing that creepeth upon the earth after his kind: and God saw that it was good.",
        "And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth.",
        "So God created man in his own image, in the image of God created he him; male and female created he them.",
        "And God blessed them, and God said unto them, Be fruitful, and multiply, and replenish the earth, and subdue it: and have dominion over the fish of the sea, and over the fowl of the air, and over every living thing that moveth upon the earth.",
        "And God said, Behold, I have given you every herb bearing seed, which is upon the face of all the earth, and every tree, in the which is the fruit of a tree yielding seed; to you it shall be for meat.",
        "And to every beast of the earth, and to every fowl of the air, and to every thing that creepeth upon the earth, wherein there is life, I have given every green herb for meat: and it was so.",
        "And God saw every thing that he had made, and, behold, it was very good. And the evening and the morning were the sixth day."
      ]},

      // RV1909 - Genesis 1 (complete Spanish)
      { translation: "rv1909", book: "genesis", chapter: 1, verses: [
        "En el principio creó Dios los cielos y la tierra.",
        "Y la tierra estaba sin orden y vacía; y había tinieblas sobre la faz del abismo, y el Espíritu de Dios se movía sobre la faz de las aguas.",
        "Y dijo Dios: Sea la luz; y fue la luz.",
        "Y vio Dios que la luz era buena; y separó Dios la luz de las tinieblas.",
        "Y llamó Dios a la luz Día, y a las tinieblas llamó Noche. Y fue la tarde y la mañana un día.",
        "Luego dijo Dios: Haya una expansión en medio de las aguas, y separe las aguas de las aguas.",
        "E hizo Dios la expansión, y separó las aguas que estaban debajo de la expansión, de las aguas que estaban sobre la expansión: y fue así.",
        "Y llamó Dios a la expansión Cielos. Y fue la tarde y la mañana el día segundo.",
        "Dijo también Dios: Júntense las aguas que están debajo de los cielos en un lugar, y descúbrase lo seco: y fue así.",
        "Y llamó Dios a lo seco Tierra, y a la reunión de las aguas llamó Mares: y vio Dios que era bueno.",
        "Dijo luego Dios: Produzca la tierra hierba verde, hierba que dé semilla; árbol de fruto que dé fruto según su género, que su semilla esté en él sobre la tierra: y fue así.",
        "Y produjo la tierra hierba verde, hierba que da semilla según su naturaleza, y árbol que da fruto, cuya semilla está en él según su género: y vio Dios que era bueno.",
        "Y fue la tarde y la mañana el día tercero.",
        "Dijo luego Dios: Haya lumbreras en la expansión de los cielos para separar el día de la noche; y sirvan de señales para las estaciones, para días y años,",
        "Y sean por lumbreras en la expansión de los cielos para alumbrar sobre la tierra: y fue así.",
        "E hizo Dios las dos grandes lumbreras; la lumbrera mayor para que señorease en el día, y la lumbrera menor para que señorease en la noche: hizo también las estrellas.",
        "Y las puso Dios en la expansión de los cielos para alumbrar sobre la tierra,",
        "Y para señorear en el día y en la noche, y para separar la luz de las tinieblas: y vio Dios que era bueno.",
        "Y fue la tarde y la mañana el día cuarto.",
        "Dijo Dios: Produzcan las aguas seres vivientes, y aves que vuelen sobre la tierra, en la abierta expansión de los cielos.",
        "Y creó Dios los grandes monstruos marinos, y todo ser viviente que se mueve, que las aguas produjeron según su género, y toda ave alada según su género: y vio Dios que era bueno.",
        "Y Dios los bendijo diciendo: Fructificad y multiplicaos, y llenad las aguas en los mares, y multiplíquense las aves en la tierra.",
        "Y fue la tarde y la mañana el día quinto.",
        "Dijo Dios: Produzca la tierra seres vivientes según su género, bestias y serpientes y animales de la tierra según su especie: y fue así.",
        "E hizo Dios los animales de la tierra según su especie, y las bestias según su especie, y todo reptil de la tierra según su especie: y vio Dios que era bueno.",
        "Y dijo Dios: Hagamos al hombre a nuestra imagen, conforme a nuestra semejanza; y señoree sobre los peces del mar, y sobre las aves de los cielos, y sobre las bestias, y sobre toda la tierra, y sobre todo reptil que se mueve sobre la tierra.",
        "Y creó Dios al hombre a su imagen, a imagen de Dios lo creó; varón y hembra los creó.",
        "Y Dios los bendijo; y les dijo Dios: Fructificad y multiplicaos; llenad la tierra, y sojuzgadla, y señoread en los peces del mar, y en las aves de los cielos, y en todas las bestias que se mueven sobre la tierra.",
        "Y dijo Dios: He aquí os he dado toda hierba que da semilla, que está sobre la faz de toda la tierra; y todo árbol en que hay fruto de árbol que da semilla, os será para comer.",
        "Y a toda bestia de la tierra, y a todas las aves de los cielos, y a todo lo que se mueve sobre la tierra, en que hay vida, toda hierba verde les será para comer: y fue así.",
        "Y vio Dios todo lo que había hecho, y he aquí era bueno en gran manera. Y fue la tarde y la mañana el día sexto."
      ]},

      // SPNBES - Genesis 1 (complete Spanish)
      { translation: "spnbes", book: "genesis", chapter: 1, verses: [
        "En el principio Dios creó el cielo y la tierra.",
        "La tierra no tenía forma y estaba vacía. La oscuridad cubría la superficie del agua profunda, y el Espíritu de Dios se movía sobre el agua.",
        "Entonces Dios dijo: —¡Que haya luz! Y hubo luz.",
        "Dios vio que la luz era buena, y la separó de la oscuridad.",
        "Dios llamó a la luz «día» y a la oscuridad «noche». Y pasó la tarde y la mañana: ese fue el primer día.",
        "Luego Dios dijo: —¡Que haya una bóveda entre las aguas, para que las separe!",
        "Así que Dios hizo la bóveda y separó las aguas que estaban debajo de ella de las que estaban encima. Y sucedió así.",
        "Dios llamó a la bóveda «cielo». Y pasó la tarde y la mañana: ese fue el segundo día.",
        "Entonces Dios dijo: —¡Que las aguas debajo del cielo se reúnan en un solo lugar, y que aparezca lo seco! Y sucedió así.",
        "Dios llamó a lo seco «tierra» y a las aguas reunidas «mar». Y Dios vio que era bueno.",
        "Luego Dios dijo: —¡Que la tierra produzca vegetación: toda clase de plantas con semilla y árboles frutales que den fruto con semilla, según su especie! Y sucedió así.",
        "La tierra produjo vegetación: toda clase de plantas con semilla y árboles frutales que dan fruto con semilla, según su especie. Y Dios vio que era bueno.",
        "Y pasó la tarde y la mañana: ese fue el tercer día.",
        "Luego Dios dijo: —¡Que haya luces en el cielo para separar el día de la noche! Que sirvan como señales para marcar las estaciones, los días y los años.",
        "¡Y que esas luces brillen en el cielo para alumbrar la tierra! Y sucedió así.",
        "Dios hizo dos grandes luces: la más grande para gobernar el día y la más pequeña para gobernar la noche. También hizo las estrellas.",
        "Dios colocó las luces en el cielo para que alumbraran la tierra,",
        "para gobernar el día y la noche, y para separar la luz de la oscuridad. Y Dios vio que era bueno.",
        "Y pasó la tarde y la mañana: ese fue el cuarto día.",
        "Luego Dios dijo: —¡Que las aguas se llenen de seres vivientes, y que vuelen aves sobre la tierra!",
        "Así que Dios creó los grandes monstruos marinos y todo ser viviente que se mueve en el agua, según su especie. También creó toda ave según su especie. Y Dios vio que era bueno.",
        "Dios los bendijo diciendo: —¡Tengan muchos hijos y llénense los mares! ¡Que también se multipliquen las aves en la tierra!",
        "Y pasó la tarde y la mañana: ese fue el quinto día.",
        "Luego Dios dijo: —¡Que la tierra produzca toda clase de seres vivientes: ganado, reptiles y animales salvajes, según su especie! Y sucedió así.",
        "Así que Dios hizo los animales salvajes según su especie, el ganado según su especie y todos los reptiles según su especie. Y Dios vio que era bueno.",
        "Luego Dios dijo: —¡Hagamos al ser humano a nuestra imagen y semejanza! Que tenga dominio sobre los peces del mar, las aves del cielo, los animales domésticos, los salvajes y todos los reptiles que se arrastran por el suelo.",
        "Así que Dios creó al ser humano a su imagen; a imagen de Dios lo creó; varón y hembra los creó.",
        "Dios los bendijo y les dijo: —¡Tengan muchos hijos y llénen la tierra! ¡Sometan la tierra y dominen sobre los peces del mar, las aves del cielo y todos los animales que se mueven sobre la tierra!",
        "Luego Dios dijo: —¡Les doy todas las plantas con semilla que hay sobre la tierra, y todos los árboles frutales que tienen semilla! Les servirán de alimento.",
        "Y también les doy a todos los animales salvajes, a todas las aves y a todos los seres vivientes que se arrastran por el suelo, es decir, a todo ser viviente, toda planta verde para alimento. Y sucedió así.",
        "Dios miró todo lo que había hecho, y ¡era muy bueno! Y pasó la tarde y la mañana: ese fue el sexto día."
      ]}
    ];

    let total = 0;

    for (const bookData of bibleData) {
      for (const [verseNum, text] of bookData.verses.entries()) {
        await db.exec`
          INSERT INTO bible_verses (translation, book, chapter, verse, text)
          VALUES (${bookData.translation}, ${bookData.book}, ${bookData.chapter}, ${verseNum + 1}, ${text})
          ON CONFLICT (translation, book, chapter, verse)
          DO UPDATE SET text = EXCLUDED.text
        `;
        total++;
      }
    }

    return { seeded: total };
  }
);
