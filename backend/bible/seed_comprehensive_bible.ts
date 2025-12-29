import { api, APIError } from "encore.dev/api";
import db from "../db";

interface SeedRequest {
  passcode: string;
}

interface SeedResponse {
  seeded: number;
}

// Comprehensive Bible verses for major books - KJV
const COMPREHENSIVE_KJV = {
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
      "And God saw every thing that he had made, and, behold, it was very good. And the evening and the morning were the sixth day.",
      "Thus the heavens and the earth were finished, and all the host of them.",
      "And on the seventh day God ended his work which he had made; and he rested on the seventh day from all his work which he had made.",
      "And God blessed the seventh day, and sanctified it: because that in it he had rested from all his work which God created and made."
    ],
    2: [
      "These are the generations of the heavens and of the earth when they were created, in the day that the LORD God made the earth and the heavens,",
      "And every plant of the field before it was in the earth, and every herb of the field before it grew: for the LORD God had not caused it to rain upon the earth, and there was not a man to till the ground.",
      "But there went up a mist from the earth, and watered the whole face of the ground.",
      "And the LORD God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living soul.",
      "And the LORD God planted a garden eastward in Eden; and there he put the man whom he had formed.",
      "And out of the ground made the LORD God to grow every tree that is pleasant to the sight, and good for food; the tree of life also in the midst of the garden, and the tree of knowledge of good and evil.",
      "And a river went out of Eden to water the garden; and from thence it was parted, and became into four heads.",
      "The name of the first is Pison: that is it which compasseth the whole land of Havilah, where there is gold;",
      "And the gold of that land is good: there is bdellium and the onyx stone.",
      "And the name of the second river is Gihon: the same is it that compasseth the whole land of Ethiopia.",
      "And the name of the third river is Hiddekel: that is it which goeth toward the east of Assyria. And the fourth river is Euphrates.",
      "And the LORD God took the man, and put him into the garden of Eden to dress it and to keep it.",
      "And the LORD God commanded the man, saying, Of every tree of the garden thou mayest freely eat:",
      "But of the tree of the knowledge of good and evil, thou shalt not eat of it: for in the day that thou eatest thereof thou shalt surely die.",
      "And the LORD God said, It is not good that the man should be alone; I will make him an help meet for him.",
      "And out of the ground the LORD God formed every beast of the field, and every fowl of the air; and brought them unto Adam to see what he would call them: and whatsoever Adam called every living creature, that was the name thereof.",
      "And Adam gave names to all cattle, and to the fowl of the air, and to every beast of the field; but for Adam there was not found an help meet for him.",
      "And the LORD God caused a deep sleep to fall upon Adam, and he slept: and he took one of his ribs, and closed up the flesh instead thereof;",
      "And the rib, which the LORD God had taken from man, made he a woman, and brought her unto the man.",
      "And Adam said, This is now bone of my bones, and flesh of my flesh: she shall be called Woman, because she was taken out of Man.",
      "Therefore shall a man leave his father and his mother, and shall cleave unto his wife: and they shall be one flesh.",
      "And they were both naked, the man and his wife, and were not ashamed."
    ],
    3: [
      "Now the serpent was more subtil than any beast of the field which the LORD God had made. And he said unto the woman, Yea, hath God said, Ye shall not eat of every tree of the garden?",
      "And the woman said unto the serpent, We may eat of the fruit of the trees of the garden:",
      "But of the fruit of the tree which is in the midst of the garden, God hath said, Ye shall not eat of it, neither shall ye touch it, lest ye die.",
      "And the serpent said unto the woman, Ye shall not surely die:",
      "For God doth know that in the day ye eat thereof, then your eyes shall be opened, and ye shall be as gods, knowing good and evil.",
      "And when the woman saw that the tree was good for food, and that it was pleasant to the eyes, and a tree to be desired to make one wise, she took of the fruit thereof, and did eat, and gave also unto her husband with her; and he did eat.",
      "And the eyes of them both were opened, and they knew that they were naked; and they sewed fig leaves together, and made themselves aprons.",
      "And they heard the voice of the LORD God walking in the garden in the cool of the day: and Adam and his wife hid themselves from the presence of the LORD God amongst the trees of the garden.",
      "And the LORD God called unto Adam, and said unto him, Where art thou?",
      "And he said, I heard thy voice in the garden, and I was afraid, because I was naked; and I hid myself.",
      "And he said, Who told thee that thou wast naked? Hast thou eaten of the tree, whereof I commanded thee that thou shouldest not eat?",
      "And the man said, The woman whom thou gavest to be with me, she gave me of the tree, and I did eat.",
      "And the LORD God said unto the woman, What is this that thou hast done? And the woman said, The serpent beguiled me, and I did eat.",
      "And the LORD God said unto the serpent, Because thou hast done this, thou art cursed above all cattle, and above every beast of the field; upon thy belly shalt thou go, and dust shalt thou eat all the days of thy life:",
      "And I will put enmity between thee and the woman, and between thy seed and her seed; it shall bruise thy head, and thou shalt bruise his heel.",
      "Unto the woman he said, I will greatly multiply thy sorrow and thy conception; in sorrow thou shalt bring forth children; and thy desire shall be to thy husband, and he shall rule over thee.",
      "And unto Adam he said, Because thou hast hearkened unto the voice of thy wife, and hast eaten of the tree, of which I commanded thee, saying, Thou shalt not eat of it: cursed is the ground for thy sake; in sorrow shalt thou eat of it all the days of thy life;",
      "Thorns also and thistles shall it bring forth to thee; and thou shalt eat the herb of the field;",
      "In the sweat of thy face shalt thou eat bread, till thou return unto the ground; for out of it wast thou taken: for dust thou art, and unto dust shalt thou return.",
      "And Adam called his wife's name Eve; because she was the mother of all living.",
      "Unto Adam also and to his wife did the LORD God make coats of skins, and clothed them.",
      "And the LORD God said, Behold, the man is become as one of us, to know good and evil: and now, lest he put forth his hand, and take also of the tree of life, and eat, and live for ever:",
      "Therefore the LORD God sent him forth from the garden of Eden, to till the ground from whence he was taken.",
      "So he drove out the man; and he placed at the east of the garden of Eden Cherubims, and a flaming sword which turned every way, to keep the way of the tree of life."
    ]
  },
  "john": {
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
      "No man hath seen God at any time; the only begotten Son, which is in the bosom of the Father, he hath declared him.",
      "And this is the record of John, when the Jews sent priests and Levites from Jerusalem to ask him, Who art thou?",
      "And he confessed, and denied not; but confessed, I am not the Christ.",
      "And they asked him, What then? Art thou Elias? And he saith, I am not. Art thou that prophet? And he answered, No.",
      "Then said they unto him, Who art thou? that we may give an answer to them that sent us. What sayest thou of thyself?",
      "He said, I am the voice of one crying in the wilderness, Make straight the way of the Lord, as said the prophet Esaias.",
      "And they which were sent were of the Pharisees.",
      "And they asked him, and said unto him, Why baptizest thou then, if thou be not that Christ, nor Elias, neither that prophet?",
      "John answered them, saying, I baptize with water: but there standeth one among you, whom ye know not;",
      "He it is, who coming after me is preferred before me, whose shoe's latchet I am not worthy to unloose.",
      "These things were done in Bethabara beyond Jordan, where John was baptizing.",
      "The next day John seeth Jesus coming unto him, and saith, Behold the Lamb of God, which taketh away the sin of the world.",
      "This is he of whom I said, After me cometh a man which is preferred before me: for he was before me.",
      "And I knew him not: but that he should be made manifest to Israel, therefore am I come baptizing with water.",
      "And John bare record, saying, I saw the Spirit descending from heaven like a dove, and it abode upon him.",
      "And I knew him not: but he that sent me to baptize with water, the same said unto me, Upon whom thou shalt see the Spirit descending, and remaining on him, the same is he which baptizeth with the Holy Ghost.",
      "And I saw, and bare record that this is the Son of God.",
      "Again the next day after John stood, and two of his disciples;",
      "And looking upon Jesus as he walked, he saith, Behold the Lamb of God!",
      "And the two disciples heard him speak, and they followed Jesus.",
      "Then Jesus turned, and saw them following, and saith unto them, What seek ye? They said unto him, Rabbi, (which is to say, being interpreted, Master,) where dwellest thou?",
      "He saith unto them, Come and see. They came and saw where he dwelt, and abode with him that day: for it was about the tenth hour.",
      "One of the two which heard John speak, and followed him, was Andrew, Simon Peter's brother.",
      "He first findeth his own brother Simon, and saith unto him, We have found the Messias, which is, being interpreted, the Christ.",
      "And he brought him to Jesus. And when Jesus beheld him, he said, Thou art Simon the son of Jona: thou shalt be called Cephas, which is by interpretation, A stone.",
      "The day following Jesus would go forth into Galilee, and findeth Philip, and saith unto him, Follow me.",
      "Now Philip was of Bethsaida, the city of Andrew and Peter.",
      "Philip findeth Nathanael, and saith unto him, We have found him, of whom Moses in the law, and the prophets, did write, Jesus of Nazareth, the son of Joseph.",
      "And Nathanael said unto him, Can there any good thing come out of Nazareth? Philip saith unto him, Come and see.",
      "Jesus saw Nathanael coming to him, and saith of him, Behold an Israelite indeed, in whom is no guile!",
      "Nathanael saith unto him, Whence knowest thou me? Jesus answered and said unto him, Before that Philip called thee, when thou wast under the fig tree, I saw thee.",
      "Nathanael answered and said unto him, Rabbi, thou art the Son of God; thou art the King of Israel.",
      "Jesus answered and said unto him, Because I said unto thee, I saw thee under the fig tree, believest thou? thou shalt see greater things than these.",
      "And he saith unto him, Verily, verily, I say unto you, Hereafter ye shall see heaven open, and the angels of God ascending and descending upon the Son of man."
    ],
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
      "That whosoever believeth in him should not perish, but have eternal life.",
      "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      "For God sent not his Son into the world to condemn the world; but that the world through him might be saved.",
      "He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.",
      "And this is the condemnation, that light is come into the world, and men loved darkness rather than light, because their deeds were evil.",
      "For every one that doeth evil hateth the light, neither cometh to the light, lest his deeds should be reproved.",
      "But he that doeth truth cometh to the light, that his deeds may be made manifest, that they are wrought in God.",
      "After these things came Jesus and his disciples into the land of Judaea; and there he tarried with them, and baptized.",
      "And John also was baptizing in Aenon near to Salim, because there was much water there: and they came, and were baptized.",
      "For John was not yet cast into prison.",
      "Then there arose a question between some of John's disciples and the Jews about purifying.",
      "And they came unto John, and said unto him, Rabbi, he that was with thee beyond Jordan, to whom thou barest witness, behold, the same baptizeth, and all men come to him.",
      "John answered and said, A man can receive nothing, except it be given him from heaven.",
      "Ye yourselves bear me witness, that I said, I am not the Christ, but that I am sent before him.",
      "He that hath the bride is the bridegroom: but the friend of the bridegroom, which standeth and heareth him, rejoiceth greatly because of the bridegroom's voice: this my joy therefore is fulfilled.",
      "He must increase, but I must decrease.",
      "He that cometh from above is above all: he that is of the earth is earthly, and speaketh of the earth: he that cometh from heaven is above all.",
      "And what he hath seen and heard, that he testifieth; and no man receiveth his testimony.",
      "He that hath received his testimony hath set to his seal that God is true.",
      "For he whom God hath sent speaketh the words of God: for God giveth not the Spirit by measure unto him.",
      "The Father loveth the Son, and hath given all things into his hand.",
      "He that believeth on the Son hath everlasting life: and he that believeth not the Son shall not see life; but the wrath of God abideth on him."
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
  "proverbs": {
    3: [
      "My son, forget not my law; but let thine heart keep my commandments:",
      "For length of days, and long life, and peace, shall they add to thee.",
      "Let not mercy and truth forsake thee: bind them about thy neck; write them upon the table of thine heart:",
      "So shalt thou find favour and good understanding in the sight of God and man.",
      "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
      "In all thy ways acknowledge him, and he shall direct thy paths.",
      "Be not wise in thine own eyes: fear the LORD, and depart from evil.",
      "It shall be health to thy navel, and marrow to thy bones.",
      "Honour the LORD with thy substance, and with the firstfruits of all thine increase:",
      "So shall thy barns be filled with plenty, and thy presses shall burst out with new wine.",
      "My son, despise not the chastening of the LORD; neither be weary of his correction:",
      "For whom the LORD loveth he correcteth; even as a father the son in whom he delighteth.",
      "Happy is the man that findeth wisdom, and the man that getteth understanding.",
      "For the merchandise of it is better than the merchandise of silver, and the gain thereof than fine gold.",
      "She is more precious than rubies: and all the things thou canst desire are not to be compared unto her.",
      "Length of days is in her right hand; and in her left hand riches and honour.",
      "Her ways are ways of pleasantness, and all her paths are peace.",
      "She is a tree of life to them that lay hold upon her: and happy is every one that retaineth her.",
      "The LORD by wisdom hath founded the earth; by understanding hath he established the heavens.",
      "By his knowledge the depths are broken up, and the clouds drop down the dew.",
      "My son, let not them depart from thine eyes: keep sound wisdom and discretion:",
      "So shall they be life unto thy soul, and grace to thy neck.",
      "Then shalt thou walk in thy way safely, and thy foot shall not stumble.",
      "When thou liest down, thou shalt not be afraid: yea, thou shalt lie down, and thy sleep shall be sweet.",
      "Be not afraid of sudden fear, neither of the wickedness of the wicked when it shall come.",
      "For the LORD shall be thy confidence, and shall keep thy foot from being taken.",
      "Withhold not good from them to whom it is due, when it is in the power of thine hand to do it.",
      "Say not unto thy neighbour, Go, and come again, and to morrow I will give; when thou hast it by thee.",
      "Devise not evil against thy neighbour, seeing he dwelleth securely by thee.",
      "Strive not with a man without cause, if he have done thee no harm.",
      "Envy not the oppressor, and choose none of his ways.",
      "For the froward is abomination to the LORD: but his secret is with the righteous.",
      "The curse of the LORD is in the house of the wicked: but he blesseth the habitation of the just.",
      "Surely he scorneth the scorners: but he giveth grace unto the lowly.",
      "The wise shall inherit glory: but shame shall be the promotion of fools."
    ]
  }
};

export const seedComprehensiveBible = api<SeedRequest, SeedResponse>(
  { expose: true, method: "POST", path: "/bible/seed/comprehensive", auth: false },
  async (req) => {
    if (req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }

    let total = 0;

    // Clear existing data
    await db.exec`DELETE FROM bible_verses`;

    // Seed comprehensive KJV verses
    for (const [book, chapters] of Object.entries(COMPREHENSIVE_KJV)) {
      for (const [chapterNum, verses] of Object.entries(chapters)) {
        for (const [verseNum, text] of verses.entries()) {
          await db.exec`
            INSERT INTO bible_verses (translation, book, chapter, verse, text)
            VALUES ('kjv', ${book}, ${parseInt(chapterNum)}, ${verseNum + 1}, ${text})
          `;
          total++;
        }
      }
    }

    // Add Spanish translations for key verses
    const spanishKeyVerses = [
      { book: "genesis", chapter: 1, verse: 1, text: "En el principio creó Dios los cielos y la tierra." },
      { book: "genesis", chapter: 1, verse: 3, text: "Y dijo Dios: Sea la luz; y fue la luz." },
      { book: "john", chapter: 3, verse: 16, text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna." },
      { book: "psalms", chapter: 23, verse: 1, text: "Jehová es mi pastor; nada me faltará." },
      { book: "psalms", chapter: 23, verse: 4, text: "Aunque ande en valle de sombra de muerte, no temeré mal alguno, porque tú estarás conmigo; tu vara y tu cayado me consolarán." }
    ];

    // Add RV1909 versions
    for (const verse of spanishKeyVerses) {
      await db.exec`
        INSERT INTO bible_verses (translation, book, chapter, verse, text)
        VALUES ('rv1909', ${verse.book}, ${verse.chapter}, ${verse.verse}, ${verse.text})
      `;
      total++;
    }

    // Add SPNBES versions  
    for (const verse of spanishKeyVerses) {
      await db.exec`
        INSERT INTO bible_verses (translation, book, chapter, verse, text)
        VALUES ('spnbes', ${verse.book}, ${verse.chapter}, ${verse.verse}, ${verse.text})
      `;
      total++;
    }

    return { seeded: total };
  }
);
