const regex = /\*\*\*START_FEEDBACK_ADJUSTMENTS\*\*\*[\s\S]*?\*\*\*END_FEEDBACK_ADJUSTMENTS\*\*\*/;

// This is your new LLM output text
const newFeedbackText = $input.first().json.text;

// Wrap it with markers
const newFeedbackSection = `***START_FEEDBACK_ADJUSTMENTS***\n${newFeedbackText}\n***END_FEEDBACK_ADJUSTMENTS***`;

// Replace old feedback section with new one
const updatedSystemPrompt =$('Prompts').first().json.systemPrompt.replace(regex, newFeedbackSection);

return [
  {
    "json": {
      updatedSystemPrompt
    }
  }
];
