const data=$('Grouping').first().json.groups;
const message_threads=data.find(x => x.conversationId === $('Loop Over Items1').first().json.conversationId).decomposedMessages;

return {
  name:    $('Loop Over Items1').first().json.name,
  month:   $('Loop Over Items1').first().json.month,
  convID:  $('Loop Over Items1').first().json.conversationId,
  subject: $('Loop Over Items1').first().json.subject,
  summary: $('Loop Over Items1').first().json.summary,
  summary_full: $('Loop Over Items1').first().json["summary-full"],
  classification_tags: Object.keys($input.first().json.output || {}).length > 0
    ? $input.first().json.output.classification_tags.join(" ")
    : "LLM_FAILED",
  message_threads:JSON.stringify(message_threads),
  message_threads_len:message_threads.length,
sla_status:Object.keys($input.first().json.output || {}).length > 0
    ? $input.first().json.output.sla_status
    : "",
  time_delta: Object.keys($input.first().json.output || {}).length > 0
    ? $input.first().json.output.time_delta
    : "",
  reasoning: Object.keys($input.first().json.output || {}).length > 0
    ? $input.first().json.output.reasoning
    : "",
  client_name: Object.keys($input.first().json.output || {}).length > 0
    ? $input.first().json.output.external_company
    : ""
};