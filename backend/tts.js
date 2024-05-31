const textToSpeech = require("@google-cloud/text-to-speech");
const fs = require("fs");
const util = require("util");

// Get the text to be spoken.
const text = `
Many modern professions are antifragile, but at everybody else’s expense.
In the months preceding the 2008 financial crisis, a great many financial experts in the world’s business schools and newspapers confidently informed us that there was no need to worry about the economy. The “experts” were of course very wrong: the global economy did collapse and many people lost their investments, homes and pensions.

Now, you’d think that because of their failure to predict one of the biggest financial collapses of all time, these experts would find themselves in hot water. In fact, a vast majority of them kept their influential positions without even having to apologize for their mistakes. This is because the field they work in is relatively narrow, and all the experts were familiar with each other and interdependent, which meant they weren’t too eager to criticize each other. Soon their mistakes were largely forgotten.
`;

// Create a request object.
const request = {
  input: {
    text: text,
  },
  voice: {
    languageCode: "en-US",
    ssmlGender: "MALE",
  },
  audioConfig: {
    audioEncoding: "MP3",
  },
};

// Create client
const client = new textToSpeech.TextToSpeechClient();

// Define async function
async function synthesizeSpeech() {
  // Make the request.
  const [response] = await client.synthesizeSpeech(request);

  // Get the audio data.
  const audioData = response.audioContent;

  // Write the audio data to a file.
  await util.promisify(fs.writeFile)("output.mp3", audioData, "binary");

  // Add time markers for each word and sentence.
  const words = text.split(" ");
  const sentences = text.split(".");

  const markers = [];
  for (let i = 0; i < words.length; i++) {
    markers.push({
      start: i * 1000,
      text: words[i],
    });
  }

  for (let i = 0; i < sentences.length; i++) {
    markers.push({
      start: i * 1000 + sentences[i].length * 1000,
      text: sentences[i],
    });
  }

  // Write the time markers to a file.
  await util.promisify(fs.writeFile)(
    "markers.json",
    JSON.stringify(markers, null, 2)
  );
}

// Call the function
synthesizeSpeech().catch(console.error);
