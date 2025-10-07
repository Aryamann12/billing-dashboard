// const fs = require('fs');

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeSubject(text) {
  if (!text) return '';
  const normalized = String(text)
    .toLowerCase()
    .replace(/^(?:\s*(?:re|fw|fwd)\s*:\s*)+/gi, '')
    .trim()
    .replace(/\s+/g, ' ');
  return normalized;
}

function removeSubjectFromContent(content, subjectsToStrip) {
  if (!content) return content;
  const subjectList = (Array.isArray(subjectsToStrip) ? subjectsToStrip : [subjectsToStrip]).filter(Boolean);
  if (subjectList.length === 0) return content;
  const normalizedSubjects = subjectList.map(normalizeSubject).filter(Boolean);
  let cleaned = content;
  for (const subj of subjectList) {
    if (!subj) continue;
    const subjPattern = new RegExp(`^(?:\\s*(?:re|fw|fwd)\\s*:\\s*)*${escapeRegExp(subj)}(?:\\s+|\\s*$)`, 'i');
    cleaned = cleaned.replace(subjPattern, '').trimStart();
  }
  const lines = cleaned.split(/\r?\n/);
  const kept = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      kept.push(line);
      continue;
    }
    const subjectPrefixMatch = /^subject\s*:\s*(.*)$/i.exec(trimmed);
    if (subjectPrefixMatch) {
      const after = subjectPrefixMatch[1].trim();
      const normAfter = normalizeSubject(after);
      if (normalizedSubjects.includes(normAfter)) {
        continue;
      }
    }
    const normLine = normalizeSubject(trimmed);
    if (normalizedSubjects.includes(normLine)) {
      continue;
    }
    kept.push(line);
  }
  cleaned = kept.join('\n').trim();
  return cleaned;
}

function sanitizeHeaderFields(content) {
  if (!content) return content;
  let sanitized = content;
  sanitized = sanitized.replace(/(From:|Sent:|To:|Cc:|Bcc:|Subject:|Date:)/gi, '\n$1');
  const headerKeys = new Set(['from', 'sent', 'to', 'cc', 'bcc', 'subject', 'date']);
  const lines = sanitized.split(/\r?\n/);
  const keptLines = [];
  for (const rawLine of lines) {
    const line = rawLine;
    const trimmed = line.trim();
    if (!trimmed) {
      keptLines.push(line);
      continue;
    }
    const headerMatch = /^(?:[>\-\s]*)([A-Za-z]{2,})\s*:\s*/.exec(trimmed);
    if (headerMatch) {
      const key = headerMatch[1].toLowerCase();
      if (headerKeys.has(key)) {
        continue;
      }
    }
    if (/^(re|fw|fwd)\s*:/i.test(trimmed)) {
      continue;
    }
    keptLines.push(line);
  }
  const collapsed = keptLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return collapsed;
}

function pad2(num) {
  return String(num).padStart(2, '0');
}

function formatDateTime(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  const day = pad2(d.getDate());
  const month = pad2(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours24 = pad2(d.getHours());
  const minutes = pad2(d.getMinutes());
  return `${day}/${month}/${year} - ${hours24}:${minutes}`;
}

function parseFormattedDateTime(str) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2}):(\d{2})$/i.exec(String(str || '').trim());
  if (!m) return Number.NaN;
  const [, dd, MM, yyyy, HH, mm] = m;
  const hours = parseInt(HH, 10);
  const minutes = parseInt(mm, 10);
  const day = parseInt(dd, 10);
  const monthIdx = parseInt(MM, 10) - 1;
  const date = new Date(Date.UTC(parseInt(yyyy, 10), monthIdx, day, hours, minutes, 0));
  return date.getTime();
}

function capitalize(str) {
  return String(str || '').charAt(0).toUpperCase() + String(str || '').slice(1);
}

function normalizeAddressArray(arr) {
  const values = Array.isArray(arr) ? arr : [];
  const cleaned = values
    .map(v => String(v || '').trim())
    .filter(v => v.length > 0)
    .map(v => v.toLowerCase());
  return Array.from(new Set(cleaned)).sort();
}

function participantsSignature(p) {
  const from = normalizeAddressArray(p?.from);
  const to = normalizeAddressArray(p?.to);
  const cc = normalizeAddressArray(p?.cc);
  return JSON.stringify({ from, to, cc });
}

function formatParticipantsMarkdown(participants, timestamp = '') {
  let md = `**Participants**\n`;
  if (timestamp) {
    md += `**Date:** ${timestamp}\n`;
  }
  for (const [key, value] of Object.entries(participants || {})) {
    if (Array.isArray(value)) {
      md += `- ${capitalize(key)} → ${value.join(', ') || 'N/A'}  \n`;
    } else if (value && typeof value === 'object') {
      for (const [subKey, subVal] of Object.entries(value)) {
        const arr = Array.isArray(subVal) ? subVal : [];
        md += `- ${capitalize(key)} (${subKey}) → ${arr.join(', ') || 'N/A'}  \n`;
      }
    }
  }
  return md.trim();
}

function decomposeEmailThread(emailData) {
  const { cleanedText, receivedDateTime, participants } = emailData || {};
  const baseSubject = normalizeSubject(emailData?.subject || '');
  const messages = [];

  if (!cleanedText || typeof cleanedText !== 'string') {
    return { decomposedMessages: [], messageCount: 0 };
  }

  // NEW: Helper to extract sender from participants
  function getSenderFromParticipants(timestamp) {
    if (!participants?.from?.[0]) return null;
    const email = participants.from[0];
    const match = email.match(/^([a-z]+)\.([a-z]+)@/i);
    if (match) {
      return `${match[1].charAt(0).toUpperCase() + match[1].slice(1)} ${match[2].charAt(0).toUpperCase() + match[2].slice(1)}`;
    }
    return email.split('@')[0].replace(/[._]/g, ' ');
  }

  // IMPROVED: More robust regex that handles edge cases
  const fromMatches = [...cleanedText.matchAll(
    /From:\s*([^\n\r]+?)\s+Sent:\s*([^\n\r]+?)\s+To:\s*([^\n\r]+?)(?:\s+Cc:\s*([^\n\r]+?))?\s+Subject:\s*([^\n\r]+?)\s*\n{1,}([\s\S]*?)(?=\nFrom:\s|$)/gi
  )];

  if (fromMatches.length > 0) {
    const firstFromIndex = cleanedText.indexOf('From:');
    if (firstFromIndex > 0) {
      const firstMessage = cleanedText.substring(0, firstFromIndex).trim();
      if (firstMessage) {
        // IMPROVED: Try multiple sender extraction methods
        let sender = null;
        const senderMatch = firstMessage.match(/(?:Thank you|Thanks|Regards|Best),?\s*\n+\s*([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i);
        sender = senderMatch?.[1]?.trim() || getSenderFromParticipants(receivedDateTime) || 'Unknown';

        const cleanedContent = sanitizeHeaderFields(
          removeSubjectFromContent(firstMessage, [emailData.subject, baseSubject])
        );
        messages.push({
          id: 1,
          sender: sender,
          subject: baseSubject,
          content: cleanedContent,
          sortTimestampMs: new Date(receivedDateTime).getTime(),
          isOriginal: true
        });
      }
    }

    fromMatches.forEach((match, index) => {
      const [, from, sent, to, cc, subject, content] = match;

      // IMPROVED: Better date parsing
      let parsedDate = new Date(receivedDateTime);
      try {
        const dateStr = sent.trim().replace(/^\w+,\s*/, ''); // Remove day name
        const testDate = new Date(dateStr);
        if (!isNaN(testDate.getTime())) parsedDate = testDate;
      } catch {}

      // IMPROVED: Extract sender name from "From:" field
      let sender = from.trim();
      const nameMatch = sender.match(/<([^>]+)>/); // Extract from "Name <email@domain.com>"
      if (nameMatch) {
        const email = nameMatch[1];
        const emailNameMatch = email.match(/^([a-z]+)\.([a-z]+)@/i);
        if (emailNameMatch) {
          sender = `${emailNameMatch[1].charAt(0).toUpperCase() + emailNameMatch[1].slice(1)} <${email}>`;
        }
      }

      const matchedNormalizedSubject = normalizeSubject(subject ? subject.trim() : '');
      let subjectExtra = '';
      if (matchedNormalizedSubject) {
        if (baseSubject && matchedNormalizedSubject.startsWith(baseSubject)) {
          subjectExtra = matchedNormalizedSubject.slice(baseSubject.length).trim();
        } else if (baseSubject && baseSubject.startsWith(matchedNormalizedSubject)) {
          // no-op
        } else if (matchedNormalizedSubject !== baseSubject) {
          const baseTokens = baseSubject.split(' ');
          const matchedTokens = matchedNormalizedSubject.split(' ');
          let divergenceIndex = 0;
          while (
            divergenceIndex < baseTokens.length &&
            divergenceIndex < matchedTokens.length &&
            baseTokens[divergenceIndex] === matchedTokens[divergenceIndex]
          ) {
            divergenceIndex++;
          }
          subjectExtra = matchedTokens.slice(divergenceIndex).join(' ').trim();
        }
      }

      let sanitizedContent = removeSubjectFromContent(String(content).trim(), [subject, emailData.subject, baseSubject]);
      if (subjectExtra) {
        sanitizedContent = subjectExtra + (sanitizedContent ? '\n' + sanitizedContent : '');
      }
      sanitizedContent = sanitizeHeaderFields(sanitizedContent);

      const message = {
        id: index + 2,
        sender: sender,
        to: to.trim(),
        subject: baseSubject,
        content: sanitizedContent,
        sortTimestampMs: parsedDate.getTime(),
        isOriginal: false
      };

      if (cc && cc.trim()) message.cc = cc.trim();
      messages.push(message);
    });
  } else {
    // Single message thread
    let sender = null;
    const senderMatch = cleanedText.match(/(?:Thank you|Thanks|Regards|Best),?\s*\n+\s*([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i);
    sender = senderMatch?.[1]?.trim() || getSenderFromParticipants(receivedDateTime) || 'Unknown';

    const cleanedContent = sanitizeHeaderFields(
      removeSubjectFromContent(cleanedText.trim(), [emailData.subject, baseSubject])
    );
    messages.push({
      id: 1,
      sender: sender,
      subject: baseSubject,
      content: cleanedContent,
      sortTimestampMs: new Date(receivedDateTime).getTime(),
      isOriginal: true
    });
  }

  messages.sort((a, b) => (a.sortTimestampMs ?? 0) - (b.sortTimestampMs ?? 0));
  const outputMessages = messages.map((m, idx) => {
    const outputMessage = {
      id: idx + 1,
      sender: m.sender,
      subject: m.subject,
      content: m.content,
      timestamp: formatDateTime(new Date(m.sortTimestampMs)),
      isOriginal: m.isOriginal
    };
    if (m.to) outputMessage.to = m.to;
    if (m.cc) outputMessage.cc = m.cc;
    return outputMessage;
  });

  return { decomposedMessages: outputMessages, messageCount: outputMessages.length };
}

function mergeDecompositionForGroup(group) {
  const merged = [];
  const seen = new Set();
  for (let i = 0; i < group.messages.length; i += 1) {
    const msg = group.messages[i];
    const cleanedText = msg && typeof msg.cleanedText === 'string' ? msg.cleanedText : '';
    if (!cleanedText.trim()) continue;
    const result = decomposeEmailThread(msg);
    for (const d of result.decomposedMessages) {
      const timestampStr = d.timestamp || '';
      const key = [d.sender || '', d.subject || '', timestampStr || '', String(d.content || '').slice(0, 200)].join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push({
        ...d,
        sourceIndexInGroup: i
      });
    }
  }
  merged.sort((a, b) => {
    const ad = parseFormattedDateTime(a.timestamp) || 0;
    const bd = parseFormattedDateTime(b.timestamp) || 0;
    return ad - bd;
  });
  merged.forEach((m, idx) => {
    m.id = idx + 1;
  });
  return {
    decomposedMessages: merged,
    messageCount: merged.length
  };
}

function groupByConversationId(messages) {
  if (!Array.isArray(messages)) {
    throw new Error('Input JSON must be an array of email objects');
  }

  const idToGroup = new Map();

  for (const message of messages) {
    const conversationId = message && typeof message === 'object' ? message.conversationId : undefined;
    const key = conversationId || 'UNKNOWN_CONVERSATION_ID';

    if (!idToGroup.has(key)) {
      idToGroup.set(key, { conversationId: key, messages: [] });
    }
    idToGroup.get(key).messages.push(message);
  }

  const groups = [];
  for (const group of idToGroup.values()) {
    const sigToData = new Map();
    for (let msgIndex = 0; msgIndex < group.messages.length; msgIndex++) {
      const msg = group.messages[msgIndex];
      const p = msg && typeof msg === 'object' ? msg.participants : undefined;
      if (!p || typeof p !== 'object') continue;
      const sig = participantsSignature(p);
      if (!sigToData.has(sig)) {
        const timestamp = msg.receivedDateTime ? formatDateTime(new Date(msg.receivedDateTime)) : '';
        sigToData.set(sig, {
          markdown: formatParticipantsMarkdown(p, timestamp),
          sourceIndexes: []
        });
      }
      sigToData.get(sig).sourceIndexes.push(msgIndex);
    }
    const participantsList = Array.from(sigToData.values());
    const { decomposedMessages } = mergeDecompositionForGroup(group);
    const firstMsg = group.messages[0] || {};
    const name = firstMsg.name || "";
    const month = firstMsg.month || "";
    groups.push({
      name,
      month,
      conversationId: group.conversationId,
      participants: participantsList,
      decomposedMessages
    });
  }

  return { groups };
}

const data = $input.all().map(i => i.json || {});
const r = groupByConversationId(data);
return [{ json: r }];
// const fs=require('fs')
// const data=require('./data.json');
// const r = groupByConversationId(data);
// fs.writeFileSync('data1.json', JSON.stringify(r, null, 2));