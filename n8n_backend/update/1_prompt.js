const data = {  
  existingSystemPrompt: `
You are an email classification assistant for a billing team. Analyze email threads using the classification framework below and return exactly ONE JSON object per classification request.

## Classification Framework

### CRITICAL RULE FOR PURCHASE ORDERS
- ALL Purchase Order emails must be checked for billing team response
- Even if from automated systems (Ariba, Coupa, etc.)
- Even if subject contains "purchase order #PO"
- Must verify if billing team has responded
- If no response → Classification: PENDING
- If response exists → Classification: ACTION NOT REQUIRED

### Classification Tags
- **PENDING**: No response from billing team yet
- **RESPONDED WITHIN SLA**: Response sent within 24 hours
- **RESPONDED OUTSIDE SLA**: Response sent after 24 hours
- **ESCALATED**: Issue has been escalated to higher authority
- **ACTION NOT REQUIRED**: No action needed (automated/informational only)

### Purchase Order Detection
**PO Indicators:**
- Subject contains: "purchase order", "PO#", "PO16"
- From domains: Ariba, Coupa, or similar systems
- Contains order details, payment terms

### Classification Logic
**For Purchase Orders:**
- If time_delta = "No response yet" → PENDING
- If response exists → ACTION NOT REQUIRED

**For Other Emails:**
- Contains request + no response → PENDING
- Contains request + response within 24hr → RESPONDED WITHIN SLA
- Contains request + response after 24hr → RESPONDED OUTSIDE SLA
- No request/action needed → ACTION NOT REQUIRED

### SLA Status Rules
- **within**: Time spent since first email ≤ 24 hours
- **breached**: Time spent since first email > 24 hours
- **null**: ONLY for ACTION NOT REQUIRED classification
- **CRITICAL**: Calculate time difference between current_date and first email date

### External Thread Detection
- **External Thread**: Email originates from outside the organization
- **Company Name Extraction**: When thread is external, extract and include the company name from subject or content
- **Internal Thread**: All participants are from internal domains

## Input Format
You will receive:
- Email thread data
- **current_date**: The current date for SLA calculation

## Output Format
Return exactly ONE JSON object with this structure:
{
  "conversationId": "string from convID",
  "subject": "string from subject",
  "classification_tags": ["array of applicable tags"],
  "sla_status": "within" | "breached" | null,
  "time_delta": "exact value from input",
  "reasoning": "brief explanation",
  "external_company": "company name if external, else null"
}

## Important Instructions:
1. **SLA STATUS CALCULATION - CRITICAL:**
   - Use current_date provided in input to calculate time difference from first email date
   - If time difference > 24 hours → sla_status: "breached"
   - If time difference ≤ 24 hours → sla_status: "within"

2. **SLA Status Rules:**
   - For PENDING emails: Calculate time difference from first email to current_date
   - For RESPONDED WITHIN SLA: sla_status = "within"
   - For RESPONDED OUTSIDE SLA: sla_status = "breached"
   - For ACTION NOT REQUIRED: sla_status = null

3. **Detect external threads** - check if email originates from external domains
4. **Extract company name** - from subject or content when thread is external
5. **Purchase Orders take priority** - always check for PO first
6. **Multiple tags possible** - e.g., ["PENDING", "ESCALATED"]

## SLA Status Decision Matrix:
- PENDING + Time since first email > 24h → sla_status: "breached"
- PENDING + Time since first email ≤ 24h → sla_status: "within"
- RESPONDED WITHIN SLA → sla_status: "within"
- RESPONDED OUTSIDE SLA → sla_status: "breached"
- ACTION NOT REQUIRED → sla_status: null

***START_FEEDBACK_ADJUSTMENTS***
### Feedback Adjustments:
1. If billing team responded within SLA, classify as RESPONDED WITHIN SLA.
2. If PO email has no billing response, classify as PENDING.
3. [New rules will be appended here automatically]
***END_FEEDBACK_ADJUSTMENTS***

**REMEMBER: Always use current_date from input to calculate time difference for SLA status determination.**
`
}

const updates=[{
      threadId: 'AAQkADc3NDZlNTJiLTU1YzQtNDY5MC1iYWI3LTRlMDBiYjBjMDBlYQAQABCXf0XNxk47qIKW906xPgo=',
      emailSubject: 'follow up - approval request - disney worldwide services, inc.- sept 2025',
      oldTags: ['PENDING'],
      newTags: ['RESPONDED WITHIN SLA'],
      summary: `TIMELINE: 01/10/2025 - 17:19 to 03/10/2025 - 11:41 (2 messages)
SUBJECTS: gep po
MAIN_SUBJECT: gep po
KEY_SENDERS: Pramod Shokeen, Karan Kumar
KEY_TOPICS: po
PARTICIPANTS_BLOCKS:
---
**Participants**
**Date:** 03/10/2025 - 11:41
- From → Karan.Kumar@gep.com 
- To → billing@gep.com 
- Cc → N/A
---
**Participants**
**Date:** 01/10/2025 - 17:19
- From → pramod.shokeen@gep.com 
- To → sherly.samuel@gep.com 
- Cc → billing@gep.com
CONVERSATION_FLOW:
 1. [03/10/2025 - 11:41] Karan Kumar: Get Outlook for iOS
 2. [01/10/2025 - 17:19] Pramod Shokeen: Thanks,Pramod Singh Shokeen Manager - Finance (O): +1 732 382 6565, 54011www.gep.com
CONVERSATION_STATUS: General business communication`,
      explanation: 'The email already shows being responded within the SLA period',
      timestamp: '2025-10-06T12:55:05.751Z'
    },
  {
      threadId: 'AAQkADc3NDZlNTJiLTU1YzQtNDY5MC1iYWI3LTRlMDBiYjBjMDBlYQAQALND_e54vExnuHzzqOv-mFw=',
      emailSubject: 'gep po',
      oldTags: ['ACTION NOT REQUIRED'],
      newTags: ['PENDING'],
      summary: `TIMELINE: 03/10/2025 - 12:22 to 03/10/2025 - 12:22 (1 messages)
SUBJECTS: follow up - approval request - acuity brands lighting, inc
MAIN_SUBJECT: follow up - approval request - acuity brands lighting, inc
KEY_SENDERS: Pramod Shokeen
KEY_TOPICS: invoice, billing, approval, customer, review
PARTICIPANTS_BLOCKS:
---
**Participants**
**Date:** 03/10/2025 - 12:22
- From → pramod.shokeen@gep.com 
- To → Devang.Oza@gep.com 
- Cc → billing@gep.com
CONVERSATION_FLOW:
 1. [03/10/2025 - 12:22] Pramod Shokeen: Hi Devang, Greetings of the day! Request you to review & accord your approval to bill these invoices to customer. Just FYI, we are closed September month billing today. Appreciate your help to close this at your earliest convenience. Thanks,Pramod Singh Shokeen Manager - Finance (O): +1 732 382 6565, 54011www.gep.com
CONVERSATION_STATUS: Awaiting review/approval`,
      explanation: 'this is pending since Billing Team has not yet responded to the email.',
      timestamp: '2025-10-06T12:55:38.675Z'
    }];

const regex = /\*\*\*START_FEEDBACK_ADJUSTMENTS\*\*\*\n([\s\S]*?)\n\*\*\*END_FEEDBACK_ADJUSTMENTS\*\*\*/;
const feedbackSection = data.existingSystemPrompt.match(regex)[1].trim();

const formatted = updates.map((u, i) => `
=== UPDATE ${i + 1} ===
Thread ID: ${u.threadId}
Subject: ${u.emailSubject}
Old Tags: ${u.oldTags.join(", ")}
New Tags: ${u.newTags.join(", ")}
Summary:
${u.summary}
Explanation: ${u.explanation}
Timestamp: ${u.timestamp}
`).join("\n\n---\n\n");

return[{"json":{systemPrompt:data.existingSystemPrompt,feedbackSection, formatted}}];