import timeStamps from "./timeStamps.json";

const sentences = timeStamps.filter(({ type }) => type === "sentence");

const enrichedSentences = sentences.map((sentence, index) => {
  // Find the first word in the sentence
  const wordsInSentence = timeStamps.filter(
    ({ type, start, end }) =>
      type === "word" && start >= sentence.start && end <= sentence.end
  );
  const firstWord = wordsInSentence[0];

  // Find the next word after the sentence
  const wordsAfterSentence = timeStamps.filter(
    ({ type, start }) => type === "word" && start > sentence.end
  );
  const nextWord = wordsAfterSentence[0];

  // If there's no next word, use the time of the next sentence
  const nextSentence = sentences[index + 1];
  const fallbackEndTime = nextSentence ? nextSentence.time : sentence.time;

  return {
    ...sentence,
    startTime: (firstWord ? firstWord.time : sentence.time) / 1000,
    endTime: (nextWord ? nextWord.time : fallbackEndTime) / 1000,
  };
});

export default enrichedSentences;
