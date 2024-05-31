const { Polly } = require("@aws-sdk/client-polly");
const fs = require("fs");

const REGION = "us-west-2";
const polly = new Polly({ region: REGION });

const text = `
Many modern professions are antifragile, but at everybody else’s expense.
In the months preceding the 2008 financial crisis, a great many financial experts in the world’s business schools and newspapers confidently informed us that there was no need to worry about the economy. The “experts” were of course very wrong: the global economy did collapse and many people lost their investments, homes and pensions.

Now, you’d think that because of their failure to predict one of the biggest financial collapses of all time, these experts would find themselves in hot water. In fact, a vast majority of them kept their influential positions without even having to apologize for their mistakes. This is because the field they work in is relatively narrow, and all the experts were familiar with each other and interdependent, which meant they weren’t too eager to criticize each other. Soon their mistakes were largely forgotten.
`;

const engine = "neural";
const voiceId = "Matthew";
const ssmlText = `<speak>${text}</speak>`;

const textParams = {
  Engine: engine,
  OutputFormat: "json",
  Text: ssmlText,
  VoiceId: voiceId,
  TextType: "ssml",
  SpeechMarkTypes: ["word", "sentence"],
};

const audioParams = {
  Engine: engine,
  OutputFormat: "mp3",
  Text: text,
  VoiceId: voiceId,
};

async function synthesizeSpeechText() {
  try {
    let data = [];
    let remainder = "";
    const response = await polly.synthesizeSpeech(textParams);

    response.AudioStream.on("data", (chunk) => {
      // Add the chunk to the remainder from previous chunk
      remainder += chunk.toString();
      let start = 0,
        end = 0;

      // Find JSON object boundaries and add objects to data array
      while ((end = remainder.indexOf("}", start)) >= 0) {
        // Try to parse the object and add to array
        try {
          data.push(JSON.parse(remainder.substring(start, end + 1)));
          start = end + 1;
        } catch (err) {
          // Not a full/valid JSON object yet, wait for more data
          break;
        }
      }
      // Save the remainder for next chunk
      remainder = remainder.substring(start);
    });

    response.AudioStream.on("end", () => {
      // Handle any remaining data
      if (remainder.trim()) {
        // check if remainder isn't empty after removing whitespaces
        try {
          data.push(JSON.parse(remainder));
        } catch (err) {
          console.log("Error parsing remaining data:", remainder);
        }
      }
      // Write data array to file as JSON
      fs.writeFileSync("output.json", JSON.stringify(data, null, 2));
    });
  } catch (err) {
    console.log("Error", err);
  }
}

async function synthesizeSpeechAudio() {
  try {
    const response = await polly.synthesizeSpeech(audioParams);
    response.AudioStream.pipe(fs.createWriteStream("output.mp3"));
  } catch (err) {
    console.log("Error", err);
  }
}

synthesizeSpeechText().catch(console.error);
synthesizeSpeechAudio().catch(console.error);
