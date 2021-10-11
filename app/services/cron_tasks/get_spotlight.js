require('dotenv').config();
const cheerio = require("whacko");
const { delay } = require('bluebird');
const axios = require('axios');
const animet_stream_api = process.env.ANIMET_STREAM_API_URL;
const Jikan = require('animet-jikan-wrapper');
const mal = new Jikan();
const Spotlight = require('../../models/spotlight.model');

let spotlight_data = [
    /* {
        title: 'Shinigami Bocchan to Kuro Maid',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/05171cb6e3b56485f32f633cd8f56b95.webp',
        synopsis: ` Cursed by a witch as a child, a young duke gained the unwanted power to kill every living thing he touches. Forced to move away from his family and into a large mansion deep in the woods, the duke is treated as if he does not exist and is continually shunned by his peers. However, he is not entirely alone. Rob and Alice, his butler and maid, are always by his side. Alice loves to tease him, and as their relationship grows, the duke makes it his goal to break free from his deadly curse. Of course, he is going to need some help, and who better to do this than the various inhabitants of the supernatural?`,
    }, */
   /*  {
        title: 'Meikyuu Black Company',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/17aa0fb05e24c59bad47a18ffedecf1d.webp',
        synopsis: `Kinji, who lacks any kind of work ethic, is a layabout in his modern life. One day, he finds himself transported to another world—but not in a grand fantasy of a hero welcomed with open arms. He's immediately shoved into a terrible job! Now enslaved by an evil mining company in a fantasy world, Kinji's about to really learn the meaning of hard work!`,
    }, */
    {
        title: 'Uramichi Oniisan',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/bfaedd8affad50546f1cb2e86b02380a.webp',
        synopsis: `Hello, boys and girls! Do you like guys with more than one side to them?" 31 year old Omota Uramichi is the gymnastics coach in the children's educational TV program "Together with Mama." He might be sweet on the outside, but all boys and girls are inevitably scared off whenever they get a glimpse of the adult darkness that's the result of Uramichi-sensei's emotional instability. This is a tragic eulogy to all the "boys and girls" who are now adults!`,
    },
    /* {
        title: 'Obey Me!',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/ab54a9be80273749ecf32deec4dac06b.webp',
        synposis: 'The anime will depict the lively everyday lives of the demon brothers through special episodes separate from the game’s main story (Lessons).',
    }, */
    {
        title: 'Ijiranaide, Nagatoro-san',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/5b6d76cbc853c0081bb7da9377d09836.webp',
        synopsis: `High schooler Hayase Nagatoro loves to spend her free time doing one thing, and that is to bully her Senpai! After Nagatoro and her friends stumble upon the aspiring artist's drawings, they find enjoyment in mercilessly bullying the timid Senpai. Nagatoro resolves to continue her cruel game and visits him daily so that she can force Senpai into doing whatever interests her at the time, especially if it makes him uncomfortable. Slightly aroused by and somewhat fearful of Nagatoro, Senpai is constantly roped into her antics as his interests, hobbies, appearance, and even personality are used against him as she entertains herself at his expense. As time goes on, Senpai realizes that he doesn't dislike Nagatoro's presence, and the two of them develop an uneasy friendship as one patiently puts up with the antics of the other.`,
    },
    {
        title: 'Josee to Tora to Sakana-tachi',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/819453a2ef81dffe2ac42bee356094fe.webp',
        synopsis: `A youth romantic drama with themes of growing up, the story focuses on college student Tsuneo and dreamer Josee, who lives her life stuck in a wheelchair. Josee—named after the heroine in Françoise Sagan's Wonderful Clouds—spends most of her days reading and painting until by chance she encounters Tsuneo, and decides it's time to face the real world.`,
    },
    {
        title: 'Kimetsu no Yaiba Movie: Mugen Ressha-hen',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/0ad77ea20b599f4d0170b4eda1855288.webp',
        synopsis: `After a string of mysterious disappearances begin to plague a train, the Demon Slayer Corps' multiple attempts to remedy the problem prove fruitless. To prevent further casualties, the flame pillar, Kyoujurou Rengoku, takes it upon himself to eliminate the threat. Accompanying him are some of the Corps' most promising new blood: Tanjirou Kamado, Zenitsu Agatsuma, and Inosuke Hashibira, who all hope to witness the fiery feats of this model demon slayer firsthand. Unbeknownst to them, the demonic forces responsible for the disappearances have already put their sinister plan in motion. Under this demonic presence, the group must muster every ounce of their willpower and draw their swords to save all two hundred passengers onboard. Kimetsu no Yaiba Movie: Mugen Ressha-hen delves into the deepest corners of Tanjirou's mind, putting his resolve and commitment to duty to the test.`,
    },
    /* {
        title: 'Jujutsu Kaisen (TV)',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/9a26a75d7478628160cbe024fedc5992.webp',
        synopsis: `Idly indulging in baseless paranormal activities with the Occult Club, high schooler Yuuji Itadori spends his days at either the clubroom or the hospital, where he visits his bedridden grandfather. However, this leisurely lifestyle soon takes a turn for the strange when he unknowingly encounters a cursed item. Triggering a chain of supernatural occurrences, Yuuji finds himself suddenly thrust into the world of Curses—dreadful beings formed from human malice and negativity—after swallowing the said item, revealed to be a finger belonging to the demon Sukuna Ryoumen, the "King of Curses." Yuuji experiences first-hand the threat these Curses pose to society as he discovers his own newfound powers. Introduced to the Tokyo Metropolitan Jujutsu Technical High School, he begins to walk down a path from which he cannot return—the path of a Jujutsu sorcerer.`,
    }, */
    /* {
        title: 'Black Clover (TV)',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/c865150c08989d7ea1b75f19fbb1ea83.webp',
        synopsis: `Asta and Yuno were abandoned at the same church on the same day. Raised together as children, they came to know of the "Wizard King"— a title given to the strongest mage in the kingdom—and promised that they would compete against each other for the position of the next Wizard King.`
    }, */
    {
        title: 'Shiroi Suna no Aquatope',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/ef09177ea11196e9e42f4e11263c588c.webp',
        synopsis: `Kukuru Misakino, an 18-year-old high school girl working in an aquarium, meets Fuuka Miyazawa, a former idol who lost her place in Tokyo and escaped. Fuuka will spend her days in the aquarium with her own thoughts in mind. However, the crisis of closing is approaching for the aquarium, as the girls explore their dreams and reality, loneliness and friends, bonds and conflicts.`
    },
    /* {
        title: 'Kingdom 3rd Season',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/f50cc89750b46b724e96cba5f9fe17b3.webp',
        synopsis: `Following the successful Sanyou campaign, the Qin army, including 1,000-Man Commander Li Xin, inches ever closer to fulfilling King Ying Zheng's dream of unifying China. With a major geographical foothold in the state of Wei now under its control, Qin sets its sights eastward toward the remaining warring states. Meanwhile Li Mu—an unparalleled strategist and the newly appointed prime minister of the state of Zhao—has taken advantage of Zhao's temporary truce with Qin to negotiate with the other states without interruption. `
    }, */
    {
        title: 'Nakitai Watashi wa Neko wo Kaburu',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/729e35621113cf0dd5c68a9ec6014756.webp',
        synopsis: `Miyo Sasaki is an energetic high school girl who comes from a broken family consisting of her unconfident father and an overly invested stepmother, whose attempts at connecting with Miyo come across as bothersome. Seeing Kento Hinode as a refuge from all her personal issues, she can't help herself from forcing her unorthodox demonstrations of love onto her crush.<br><br>While Miyo is unable to get Kento's attention as herself, she manages to succeed by interacting with him in the form of a white cat, affectionately nicknamed "Tarou" by Kento. But Miyo soon realizes that she can't help Kento with the various problems she overhears in her cat form and is now caught between two tough choices. Will she continue her relationship with him as a cat, or will she reveal her identity and risk what they have, in order to help him as her human self?`
    }, 
    {
        title: `Selection Project`,
        img: `https://frosty-snyder-1df076.netlify.app/spotlight/17sa0fb05e24c59bad47a18ffedecf1d.webp`,
        synopsis: `Held every summer, the national show "Selection Project" is the biggest gateway for girls who strive to be idols, and the place where the legendary idol Akari Amazawa was born. Suzune Miyama is also one who has longed for such a dream stage. Having been sick since childhood, she listened to the song of the light many times in her bed in the hospital room. Akari's singing voice gave her a lot of smiles and courage, inspiring Suzune to follow in her footsteps.`
    },
    {
        title: `Nanatsu no Taizai Movie 2: Hikari ni Norowareshi Mono-tachi`,
        img: `https://frosty-snyder-1df076.netlify.app/spotlight/d05a48850837dca6558c2520e9f75bad.webp`,
        synopsis: `With the help of the "Dragon Sin of Wrath" Meliodas and the worst rebels in history, the Seven Deadly Sins, the "Holy War", in which four races, including Humans, Goddesses, Fairies and Giants fought against the Demons, is finally over. At the cost of the "Lion Sin of Pride" Escanor's life, the Demon King was defeated and the world regained peace. After that, each of the Sins take their own path; the first being the "Boar Sin of Gluttony" Merlin, who works together with King Arthur aiming to create a new kingdom.`
    },
    {
        title: `Jahy-sama wa Kujikenai!`,
        img: `https://frosty-snyder-1df076.netlify.app/spotlight/75ab4bc4b9dcd30296b593bbc77502b1.webp`,
        synopsis: `Once respected as the Demon Realm's second greatest authority, the Demon King's aide, Jahy, ruled her subjects with fear. But when a magical girl attacks and destroys a mystic gem containing massive power, the Demon Realm is destroyed.  Although she survives, Jahy has lost almost all of her powers and finds herself stranded in the human world with a childlike appearance. In order to gather more mystic gems so that she can permanently restore both her original form and the Demon Realm`
    },
    {
        title: `Blue Period`,
        img: `https://frosty-snyder-1df076.netlify.app/spotlight/2292820f1793b077ce597157f1757478.webp`,
        synopsis: `Second-year high school student Yatora Yaguchi is bored with his normal life. He studies well and plays around with his friends, but in truth, he does not enjoy either of those activities. Bound by norms, he secretly envies those who do things differently.`,
    },
    {
        title: `Visual Prison`,
        img: `https://frosty-snyder-1df076.netlify.app/spotlight/e0662e265d3a6bb0628a31dfbe1a4e74.webp`,
        synopsis: `Ange Yuki—a boy who wrestles with deep-seated loneliness and can't fit in. With nobody to call family, he leaves his hometown. Longing to see an artist he admires perform, he heads for Harajuku, where he encounters a live battle between visual kei units ECLIPSE and LOS † EDEN. Overwhelmed by the energetic performance, he is suddenly struck by an intense pain`,
    },
    {
        title: `Tesla Note`,
        img: `https://frosty-snyder-1df076.netlify.app/spotlight/dc5c04d12a8e361645d54cd363b69b75.webp`,
        synopsis: `Mission T is a secret operation to save the world from destruction. Trained as a ninja from a young age, Botan Negoro, raised to become the ultimate spy, teams up with another excellent spy, Kuruma. Their aim is to recover the legacy of the genius inventor Nikola Tesla, the "Shards of Tesla." Can the two outwit the agents of other countries who are also pursuing these fragments? A super-original spy thriller begins. `,
    }
];

// I DONT FUCKING KNOW NEED BETTER SOURCE FOR SPOTLIGHT
let buildWeeklySpotlight = async() => {
    try {    
         // drop old Spotlight
         Spotlight.deleteMany({} , (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
        
            console.log('old Spotlight dropped ', new Date());
        });
        let newSpotlightData = new Spotlight({
            spotlight: spotlight_data,
        });
        newSpotlightData.save();
        console.log('new spotlight data saved');
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    buildWeeklySpotlight
}


