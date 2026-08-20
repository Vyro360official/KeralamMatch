import { validateChatMessageSafety, containsPhoneNumber, containsSexualOrExplicitContent } from "../modules/messaging/chat-safety";

export function runChatSafetyTestSuite() {
  const results: { test: string; passed: boolean }[] = [];

  // 1. Phone number test
  results.push({
    test: "Detects standard 10 digit Indian numbers",
    passed: containsPhoneNumber("My number is 9847012345, please call me") === true,
  });

  results.push({
    test: "Detects +91 formatted numbers",
    passed: containsPhoneNumber("+91 94471 23456") === true,
  });

  results.push({
    test: "Detects spaced digits",
    passed: containsPhoneNumber("Call me at 9 8 4 7 0 1 2 3 4 5") === true,
  });

  results.push({
    test: "Detects word-spelled digits",
    passed: containsPhoneNumber("my number is nine eight four seven zero one two three four five") === true,
  });

  // 2. Chat safety validator for phone numbers
  const phoneRes = validateChatMessageSafety("Please call me on 9847012345 tomorrow");
  results.push({
    test: "Rejects message with phone number",
    passed: !phoneRes.isValid && phoneRes.violationType === "PHONE_NUMBER",
  });

  // 3. Sexual / explicit content
  results.push({
    test: "Detects explicit sexual text",
    passed: containsSexualOrExplicitContent("Send me your nudes") === true,
  });

  results.push({
    test: "Detects inappropriate solicitation",
    passed: containsSexualOrExplicitContent("Want to hookup tonight?") === true,
  });

  results.push({
    test: "Allows clean matrimony conversation",
    passed: containsSexualOrExplicitContent("Namaskaram! How are your parents?") === false,
  });

  const explicitRes = validateChatMessageSafety("Send me your nudes");
  results.push({
    test: "Rejects explicit text",
    passed: !explicitRes.isValid && explicitRes.violationType === "EXPLICIT_CONTENT",
  });

  return results;
}
