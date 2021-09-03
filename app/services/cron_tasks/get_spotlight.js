require('dotenv').config();
const cheerio = require("whacko");
const { delay } = require('bluebird');
const axios = require('axios');
const animet_stream_api = process.env.ANIMET_STREAM_API_URL;
const Jikan = require('animet-jikan-wrapper');
const mal = new Jikan();
const Spotlight = require('../../models/spotlight.model');

let spotlight_data = [
    {
        title: 'Shinigami Bocchan to Kuro Maid',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/05171cb6e3b56485f32f633cd8f56b95.jpg',
        synopsis: ` Cursed by a witch as a child, a young duke gained the unwanted power to kill every living thing he touches. Forced to move away from his family and into a large mansion deep in the woods, the duke is treated as if he does not exist and is continually shunned by his peers. However, he is not entirely alone. Rob and Alice, his butler and maid, are always by his side. Alice loves to tease him, and as their relationship grows, the duke makes it his goal to break free from his deadly curse. Of course, he is going to need some help, and who better to do this than the various inhabitants of the supernatural?`,
    },
    {
        title: 'Meikyuu Black Company',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/17aa0fb05e24c59bad47a18ffedecf1d.jpg',
        synopsis: `Kinji, who lacks any kind of work ethic, is a layabout in his modern life. One day, he finds himself transported to another world—but not in a grand fantasy of a hero welcomed with open arms. He's immediately shoved into a terrible job! Now enslaved by an evil mining company in a fantasy world, Kinji's about to really learn the meaning of hard work!`,
    },
    {
        title: 'Uramichi Oniisan',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/bfaedd8affad50546f1cb2e86b02380a.jpg',
        synopsis: `Hello, boys and girls! Do you like guys with more than one side to them?" 31 year old Omota Uramichi is the gymnastics coach in the children's educational TV program "Together with Mama." He might be sweet on the outside, but all boys and girls are inevitably scared off whenever they get a glimpse of the adult darkness that's the result of Uramichi-sensei's emotional instability. This is a tragic eulogy to all the "boys and girls" who are now adults!`,
    },
    {
        title: 'Obey Me!',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/ab54a9be80273749ecf32deec4dac06b.jpg',
        synposis: 'The anime will depict the lively everyday lives of the demon brothers through special episodes separate from the game’s main story (Lessons).',
    },
    {
        title: 'Ijiranaide, Nagatoro-san',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/5b6d76cbc853c0081bb7da9377d09836.jpg',
        synopsis: `High schooler Hayase Nagatoro loves to spend her free time doing one thing, and that is to bully her Senpai! After Nagatoro and her friends stumble upon the aspiring artist's drawings, they find enjoyment in mercilessly bullying the timid Senpai. Nagatoro resolves to continue her cruel game and visits him daily so that she can force Senpai into doing whatever interests her at the time, especially if it makes him uncomfortable. Slightly aroused by and somewhat fearful of Nagatoro, Senpai is constantly roped into her antics as his interests, hobbies, appearance, and even personality are used against him as she entertains herself at his expense. As time goes on, Senpai realizes that he doesn't dislike Nagatoro's presence, and the two of them develop an uneasy friendship as one patiently puts up with the antics of the other.`,
    },
    {
        title: 'Josee to Tora to Sakana-tachi',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/819453a2ef81dffe2ac42bee356094fe.jpg',
        synopsis: `A youth romantic drama with themes of growing up, the story focuses on college student Tsuneo and dreamer Josee, who lives her life stuck in a wheelchair. Josee—named after the heroine in Françoise Sagan's Wonderful Clouds—spends most of her days reading and painting until by chance she encounters Tsuneo, and decides it's time to face the real world.`,
    },
    {
        title: 'Kimetsu no Yaiba Movie: Mugen Ressha-hen',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/0ad77ea20b599f4d0170b4eda1855288.jpg',
        synopsis: `After a string of mysterious disappearances begin to plague a train, the Demon Slayer Corps' multiple attempts to remedy the problem prove fruitless. To prevent further casualties, the flame pillar, Kyoujurou Rengoku, takes it upon himself to eliminate the threat. Accompanying him are some of the Corps' most promising new blood: Tanjirou Kamado, Zenitsu Agatsuma, and Inosuke Hashibira, who all hope to witness the fiery feats of this model demon slayer firsthand. Unbeknownst to them, the demonic forces responsible for the disappearances have already put their sinister plan in motion. Under this demonic presence, the group must muster every ounce of their willpower and draw their swords to save all two hundred passengers onboard. Kimetsu no Yaiba Movie: Mugen Ressha-hen delves into the deepest corners of Tanjirou's mind, putting his resolve and commitment to duty to the test.`,
    },
    {
        title: 'Jujutsu Kaisen (TV)',
        img: ' https://frosty-snyder-1df076.netlify.app/spotlight/9a26a75d7478628160cbe024fedc5992.jpg',
        synopsis: `Idly indulging in baseless paranormal activities with the Occult Club, high schooler Yuuji Itadori spends his days at either the clubroom or the hospital, where he visits his bedridden grandfather. However, this leisurely lifestyle soon takes a turn for the strange when he unknowingly encounters a cursed item. Triggering a chain of supernatural occurrences, Yuuji finds himself suddenly thrust into the world of Curses—dreadful beings formed from human malice and negativity—after swallowing the said item, revealed to be a finger belonging to the demon Sukuna Ryoumen, the "King of Curses." Yuuji experiences first-hand the threat these Curses pose to society as he discovers his own newfound powers. Introduced to the Tokyo Metropolitan Jujutsu Technical High School, he begins to walk down a path from which he cannot return—the path of a Jujutsu sorcerer.`,
    },
    {
        title: 'Black Clover (TV)',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/c865150c08989d7ea1b75f19fbb1ea83.jpg',
        synopsis: `Asta and Yuno were abandoned at the same church on the same day. Raised together as children, they came to know of the "Wizard King"— a title given to the strongest mage in the kingdom—and promised that they would compete against each other for the position of the next Wizard King.`
    },
    {
        title: 'Shiroi Suna no Aquatope',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/ef09177ea11196e9e42f4e11263c588c.jpg',
        synopsis: `Kukuru Misakino, an 18-year-old high school girl working in an aquarium, meets Fuuka Miyazawa, a former idol who lost her place in Tokyo and escaped. Fuuka will spend her days in the aquarium with her own thoughts in mind. However, the crisis of closing is approaching for the aquarium, as the girls explore their dreams and reality, loneliness and friends, bonds and conflicts.`
    },
    {
        title: 'Kingdom 3rd Season',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/f50cc89750b46b724e96cba5f9fe17b3.jpg',
        synopsis: `Following the successful Sanyou campaign, the Qin army, including 1,000-Man Commander Li Xin, inches ever closer to fulfilling King Ying Zheng's dream of unifying China. With a major geographical foothold in the state of Wei now under its control, Qin sets its sights eastward toward the remaining warring states. Meanwhile Li Mu—an unparalleled strategist and the newly appointed prime minister of the state of Zhao—has taken advantage of Zhao's temporary truce with Qin to negotiate with the other states without interruption. `
    },
    {
        title: 'Nakitai Watashi wa Neko wo Kaburu',
        img: 'https://frosty-snyder-1df076.netlify.app/spotlight/729e35621113cf0dd5c68a9ec6014756.jpg',
        synopsis: `Miyo Sasaki is an energetic high school girl who comes from a broken family consisting of her unconfident father and an overly invested stepmother, whose attempts at connecting with Miyo come across as bothersome. Seeing Kento Hinode as a refuge from all her personal issues, she can't help herself from forcing her unorthodox demonstrations of love onto her crush.<br><br>While Miyo is unable to get Kento's attention as herself, she manages to succeed by interacting with him in the form of a white cat, affectionately nicknamed "Tarou" by Kento. But Miyo soon realizes that she can't help Kento with the various problems she overhears in her cat form and is now caught between two tough choices. Will she continue her relationship with him as a cat, or will she reveal her identity and risk what they have, in order to help him as her human self?`
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

