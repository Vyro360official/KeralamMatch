import { containsPhoneNumber, containsSexualOrExplicitContent, validateChatMessageSafety } from "../src/modules/messaging/chat-safety";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${msg}`);
  }
}

console.log("\n🧪 Running KeralamMatch Safety & Moderation Tests...\n");

// 1. Phone number test
assert(containsPhoneNumber("My number is 9847012345") === true, "Detects standard 10 digit Indian number");
assert(containsPhoneNumber("+91 94471 23456") === true, "Detects +91 formatted phone number");
assert(containsPhoneNumber("call 9 8 4 7 0 1 2 3 4 5") === true, "Detects spaced digits");
assert(containsPhoneNumber("number: nine eight four seven zero one two three four five") === true, "Detects word-spelled digits");
assert(containsPhoneNumber("Hello, how are you?") === false, "Does not flag regular text as phone number");

// 2. Chat safety validator for phone numbers
const phoneRes = validateChatMessageSafety("Please call 9847012345");
assert(phoneRes.isValid === false, "Rejects message with phone number");
assert(phoneRes.violationType === "PHONE_NUMBER", "Flags PHONE_NUMBER violation type");

// 3. Sexual / explicit content
assert(containsSexualOrExplicitContent("Send me your nudes") === true, "Detects explicit sexual text");
assert(containsSexualOrExplicitContent("Want to hookup tonight?") === true, "Detects inappropriate solicitation");
assert(containsSexualOrExplicitContent("Namaskaram! How are your parents?") === false, "Allows clean matrimony conversation");

const explicitRes = validateChatMessageSafety("Send nudes please");
assert(explicitRes.isValid === false, "Rejects explicit text");
assert(explicitRes.violationType === "EXPLICIT_CONTENT", "Flags EXPLICIT_CONTENT violation type");

console.log("\n🎉 All 9 Safety and Moderation test cases PASSED successfully!\n");
