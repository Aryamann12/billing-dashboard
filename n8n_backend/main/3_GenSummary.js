// ========== UTF-8 ENCODING CLEANUP ==========

function cleanEncodingIssues(text) {
  if (!text || typeof text !== 'string') return text;

  // Common encoding issues mapping
  const encodingFixes = {
    'â€™': "'",      // Right single quotation mark
    'â€œ': '"',      // Left double quotation mark
    'â€': '"',       // Right double quotation mark
    'â€"': '—',      // Em dash
    'â€"': '–',      // En dash
    'â€¢': '•',      // Bullet point
    'â€¦': '…',      // Horizontal ellipsis
    'Ã©': 'é',       // e with acute accent
    'Ã¨': 'è',       // e with grave accent
    'Ã ': 'à',       // a with grave accent
    'Ã¢': 'â',       // a with circumflex
    'Ã§': 'ç',       // c with cedilla
    'â‚¬': '€',      // Euro sign
    'Â': '',         // Non-breaking space artifact
    'â€¨': ' ',      // Line separator
    'â€©': ' ',      // Paragraph separator
  };

  let cleaned = text;
  for (const [bad, good] of Object.entries(encodingFixes)) {
    cleaned = cleaned.replace(new RegExp(bad, 'g'), good);
  }

  // Additional cleanup for common patterns
  cleaned = cleaned
    .replace(/â€¢/g, '•')
    .replace(/â€"/g, '—')
    .replace(/â€"/g, '–')
    .replace(/â€˜/g, "'")
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/Â /g, ' ')
    .replace(/\u00A0/g, ' ')  // Non-breaking space
    .trim();

  return cleaned;
}

function cleanObjectEncodingRecursive(obj) {
  if (typeof obj === 'string') {
    return cleanEncodingIssues(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanObjectEncodingRecursive(item));
  }

  if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = cleanObjectEncodingRecursive(value);
    }
    return cleaned;
  }

  return obj;
}

function truncate(str, maxLength, forceNoTruncate = false) {
    if (!str) return '';
    if (forceNoTruncate) return str; // Option to skip truncation entirely
    return str.length > maxLength ? str.slice(0, maxLength) + '…' : str;
}

// ========== BILLING RESPONSE EXTRACTION ==========

/**
 * Extracts first email to billing and first response from billing
 * @param {Array} decomposedMessages - Array of message objects with sender, timestamp, content
 * @param {Array} participantMarkdowns - Array of participant markdown strings
 * @returns {Object} { firstEmailToBilling, firstResponseFromBilling, timeDelta }
 */
function extractBillingResponseDataInline(decomposedMessages, participantMarkdowns) {
  if (!decomposedMessages || decomposedMessages.length === 0) {
    return {
      firstEmailToBilling: null,
      firstResponseFromBilling: null,
      timeDelta: null
    };
  }

  let firstEmailToBilling = null;
  let firstResponseFromBilling = null;
  let firstEmailFromBilling = null;
  let firstResponseToBilling = null;

  // Helper: Check if email is directed to billing
  function isToBilling(message, participantMarkdowns) {
    // Check message.to field
    if (message.to && (
      message.to.toLowerCase().includes('billing') ||
      message.to.toLowerCase().includes('billing@gep.com')
    )) {
      return true;
    }

    // Check participants markdown - match by timestamp
    if (message.timestamp) {
      for (const markdown of participantMarkdowns) {
        if (markdown && markdown.includes(message.timestamp)) {
          if (markdown.toLowerCase().includes('to → billing@gep.com') ||
              markdown.toLowerCase().includes('to (main) → billing@gep.com') ||
              markdown.toLowerCase().includes('cc → billing@gep.com') ||
              markdown.toLowerCase().includes('to (cc) → billing@gep.com')) {
            return true;
          }
        }
      }
    }

    return false;
  }

  // Helper: Check if sender is billing team member
  function isFromBilling(message, participantMarkdowns) {
    const senderLower = (message.sender || '').toLowerCase();

    // Check if sender name matches known billing people
    if (senderLower.includes('billing@gep.com') ||
        senderLower.includes('billing <') ||
        senderLower === 'billing' ||
        senderLower === 'pinky pal') {
      return true;
    }

    // Check if the From field in participants markdown is from billing team
    if (message.timestamp) {
      for (const markdown of participantMarkdowns) {
        if (markdown && markdown.includes(message.timestamp)) {
          if (markdown.toLowerCase().includes('from → pinky.pal@gep.com') ||
              markdown.toLowerCase().includes('from → billing@gep.com')) {
            return true;
          }
        }
      }
    }

    return false;
  }

  // Find first email TO billing and first email FROM billing
  for (const message of decomposedMessages) {
    const toBilling = isToBilling(message, participantMarkdowns);
    const fromBilling = isFromBilling(message, participantMarkdowns);

    if (!firstEmailToBilling && toBilling && !fromBilling) {
      firstEmailToBilling = message.timestamp;
    }

    if (!firstEmailFromBilling && fromBilling) {
      firstEmailFromBilling = message.timestamp;
    }
  }

  // Find ANY response after first email to billing (could be from anyone, including billing)
  if (firstEmailToBilling) {
    for (const message of decomposedMessages) {
      // Look for ANY message after the first email to billing
      if (message.timestamp && isTimestampAfter(message.timestamp, firstEmailToBilling)) {
        firstResponseFromBilling = message.timestamp;
        break;
      }
    }
  }

  // Find ANY response after billing sends initial email
  if (firstEmailFromBilling && !firstEmailToBilling) {
    // If billing initiated the conversation, find first response
    for (const message of decomposedMessages) {
      if (!isFromBilling(message, participantMarkdowns)) {
        // Any message that's not from billing after billing's initial email
        if (message.timestamp && isTimestampAfter(message.timestamp, firstEmailFromBilling)) {
          firstResponseToBilling = message.timestamp;
          break;
        }
      }
    }
  }

  // Helper to check if timestamp1 is after timestamp2
  function isTimestampAfter(timestamp1, timestamp2) {
    const parseTimestamp = (ts) => {
      if (!ts) return null;
      try {
        const parts = ts.split(' - ');
        if (parts.length === 2) {
          const [datePart, timePart] = parts;
          const [day, month, year] = datePart.split('/');
          const [hours, minutes] = timePart.split(':');
          return new Date(year, month - 1, day, parseInt(hours), parseInt(minutes));
        }
      } catch (e) {
        return null;
      }
      return null;
    };

    const date1 = parseTimestamp(timestamp1);
    const date2 = parseTimestamp(timestamp2);

    if (!date1 || !date2) return false;
    return date1.getTime() > date2.getTime();
  }

  // Calculate time delta
  let timeDelta = null;

  // Scenario 1: Email TO billing, then response FROM billing
  if (firstEmailToBilling && firstResponseFromBilling) {
    timeDelta = calculateTimeDelta(firstEmailToBilling, firstResponseFromBilling);
  }
  // Scenario 2: Email FROM billing, then response TO billing
  else if (firstEmailFromBilling && firstResponseToBilling) {
    timeDelta = calculateTimeDelta(firstEmailFromBilling, firstResponseToBilling);
    // In this case, use billing's email as the "first email to billing" for consistency
    if (!firstEmailToBilling) {
      firstEmailToBilling = firstEmailFromBilling;
    }
    if (!firstResponseFromBilling) {
      firstResponseFromBilling = firstResponseToBilling;
    }
  }

  return {
    firstEmailToBilling,
    firstResponseFromBilling,
    timeDelta
  };
}

/**
 * Calculates time difference between two timestamps
 * @param {string} start - Start timestamp in format "DD/MM/YYYY - HH:MM"
 * @param {string} end - End timestamp in format "DD/MM/YYYY - HH:MM"
 * @returns {string} Formatted time delta like "2 Days : 3 Hours : 45 Min"
 */
function calculateTimeDelta(start, end) {
  function parseTimestamp(timestamp) {
    if (!timestamp) return null;
    try {
      const parts = timestamp.split(' - ');
      if (parts.length === 2) {
        const [datePart, timePart] = parts;
        const [day, month, year] = datePart.split('/');
        const [hours, minutes] = timePart.split(':');
        return new Date(year, month - 1, day, parseInt(hours), parseInt(minutes));
      }
    } catch (e) {
      console.warn('Failed to parse timestamp:', timestamp);
    }
    return null;
  }

  const startTime = parseTimestamp(start);
  const endTime = parseTimestamp(end);

  if (!startTime || !endTime) return null;

  const diffMs = endTime.getTime() - startTime.getTime();
  if (diffMs < 0) return null;  // End before start - invalid

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  if (diffDays > 0) {
    return `${diffDays} Days : ${remainingHours} Hours : ${remainingMinutes} Min`;
  } else if (diffHours > 0) {
    return `${diffHours} Hours : ${remainingMinutes} Min`;
  } else {
    return `${remainingMinutes} Min`;
  }
}

function extractSenderFromContent(content) {
    if (!content) return null;
    
    // Pattern 1: Look for "Regards," or "Thanks," or "Best," followed by a name
    const regardsPatterns = [
        /(?:regards|thanks|best|sincerely|cheers|best regards|kind regards|warm regards|thank you),?\s*\n+\s*([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
        /(?:regards|thanks|best|sincerely|cheers|best regards|kind regards|warm regards|thank you),?\s*([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i
    ];
    
    for (const pattern of regardsPatterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
            // Clean up the extracted name
            const name = match[1].trim();
            // Validate it looks like a name (not too long, contains letters)
            if (name.length > 2 && name.length < 50 && /^[A-Za-z\s\-\.]+$/.test(name)) {
                return name;
            }
        }
    }
    
    // Pattern 2: Look for email signatures with just a name on its own line
    // This catches cases where someone signs with just their name
    const lines = content.split('\n');
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 10); i--) {
        const line = lines[i].trim();
        // Check if line looks like a name (2-4 words, starts with capital)
        if (line && /^[A-Z][a-z]+(?: [A-Z][a-z]+){0,3}$/.test(line)) {
            // Check if the previous line is empty or contains common sign-off words
            const prevLine = i > 0 ? lines[i-1].trim().toLowerCase() : '';
            if (!prevLine || prevLine.includes('regards') || prevLine.includes('thanks') || 
                prevLine.includes('best') || prevLine.includes('sincerely')) {
                return line;
            }
        }
    }
    
    return null;
}

function extractSenderFromParticipants(participantMarkdowns, messageTimestamp) {
    if (!participantMarkdowns || !messageTimestamp) return null;
    
    // Find the participant block that matches this message's timestamp
    for (const markdown of participantMarkdowns) {
        if (markdown && markdown.includes(messageTimestamp)) {
            // Extract the "From" field
            const fromMatch = markdown.match(/- From → ([^\s\n]+)/);
            if (fromMatch) {
                const email = fromMatch[1];
                // Extract name from email if it's in format firstname.lastname@domain
                const nameMatch = email.match(/^([a-z]+)\.([a-z]+)@/i);
                if (nameMatch) {
                    const firstName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1).toLowerCase();
                    const lastName = nameMatch[2].charAt(0).toUpperCase() + nameMatch[2].slice(1).toLowerCase();
                    return `${firstName} ${lastName}`;
                }
                // Otherwise return the email username part as the sender
                const usernameMatch = email.match(/^([^@]+)@/);
                if (usernameMatch) {
                    return usernameMatch[1].replace(/[._]/g, ' ');
                }
            }
        }
    }
    return null;
}

function summarizeGroup(group) {
    // Apply encoding cleanup to the entire group first
    const cleanedGroup = cleanObjectEncodingRecursive(group);

    const { name, month, conversationId, participants = [], decomposedMessages = [] } = cleanedGroup || {};
    
    const participantMarkdowns = participants.map(p => p.markdown).filter(Boolean);

    // Extract all email addresses from participant markdowns to determine thread type
    function extractEmailsFromMarkdown(markdown) {
        const emails = [];
        if (!markdown) return emails;
        
        // Extract emails from "From → email@domain.com" format
        const fromMatch = markdown.match(/- From → ([^\s\n]+)/);
        if (fromMatch) emails.push(fromMatch[1]);
        
        // Extract emails from "To (main) → email1@domain.com, email2@domain.com" format
        const toMainMatch = markdown.match(/- To \(main\) → ([^\n]+)/);
        if (toMainMatch) {
            const emailsList = toMainMatch[1].split(',').map(email => email.trim()).filter(email => email && email !== 'N/A');
            emails.push(...emailsList);
        }
        
        // Extract emails from "To (cc) → email1@domain.com, email2@domain.com" format
        const toCcMatch = markdown.match(/- To \(cc\) → ([^\n]+)/);
        if (toCcMatch) {
            const emailsList = toCcMatch[1].split(',').map(email => email.trim()).filter(email => email && email !== 'N/A');
            emails.push(...emailsList);
        }
        
        return emails;
    }

    // Determine if thread is internal (all @gep.com) or external
    const allEmails = [];
    participantMarkdowns.forEach(markdown => {
        allEmails.push(...extractEmailsFromMarkdown(markdown));
    });

    const isInternalThread = allEmails.length > 0 && allEmails.every(email => 
        email.toLowerCase().includes('@gep.com')
    );
    const threadType = isInternalThread ? 'INTERNAL THREAD' : 'EXTERNAL THREAD';

    const subjects = new Set();
    const senders = new Set();
    const timestamps = [];
    const keyPhrases = new Set();

    // Extract first email to billing@gep.com and first response from billing@gep.com
    let firstEmailToBilling = null;
    let firstResponseFromBilling = null;
    let timeDelta = null;

    const businessTerms = [
        'invoice','billing','payment','expense','approval','client','customer',
        'po','purchase order','submission','review','rejection','portal','setup','contract','draft'
    ];

    // Helper function to convert timestamps to 24-hour format
    function convertTo24Hour(timestamp) {
        if (!timestamp) return null;
        
        // Handle format: "DD/MM/YYYY - HH:MM AM/PM"
        const parts = timestamp.split(' - ');
        if (parts.length === 2) {
            const datePart = parts[0];
            const timePart = parts[1];
            const [time, period] = timePart.split(' ');
            
            if (!period) return timestamp; // Already in 24-hour format
            
            const [hours, minutes] = time.split(':');
            let hour24 = parseInt(hours);
            
            if (period === 'PM' && hour24 !== 12) hour24 += 12;
            if (period === 'AM' && hour24 === 12) hour24 = 0;
            
            const formattedHour = hour24.toString().padStart(2, '0');
            const formattedMinutes = minutes.padStart(2, '0');
            
            return `${datePart} - ${formattedHour}:${formattedMinutes}`;
        }
        return timestamp;
    }

    // Convert all message timestamps to 24-hour format and enhance sender extraction
    decomposedMessages.forEach(message => {
        if (message.timestamp) {
            message.timestamp = convertTo24Hour(message.timestamp);
        }

        // ENHANCED SENDER EXTRACTION
        if (!message.sender || message.sender === 'Unknown') {
            // Try to extract from content
            let extractedSender = extractSenderFromContent(message.content);

            // If not found in content, try to extract from participants
            if (!extractedSender) {
                extractedSender = extractSenderFromParticipants(participantMarkdowns, message.timestamp);
            }

            if (extractedSender) {
                message.sender = extractedSender;
            }
        }
    });

    // Use enhanced billing response extractor
    const billingData = extractBillingResponseDataInline(decomposedMessages, participantMarkdowns);
    firstEmailToBilling = billingData.firstEmailToBilling;
    firstResponseFromBilling = billingData.firstResponseFromBilling;
    timeDelta = billingData.timeDelta;

    decomposedMessages.forEach(m => {
        if (m?.subject) subjects.add(String(m.subject).trim());
        if (m?.sender) senders.add(m.sender);
        if (m?.timestamp) timestamps.push(m.timestamp);
        const blob = `${m?.subject || ''} ${m?.content || ''}`.toLowerCase();
        businessTerms.forEach(term => { if (blob.includes(term)) keyPhrases.add(term); });
    });

    const startTime = timestamps[0] || null;
    const endTime = timestamps[timestamps.length - 1] || null;

    // ENHANCED: More intelligent message filtering for long conversations
    function filterMessagesForLongConversations(messages, maxLength = 3000) {
        if (!messages || messages.length === 0) return messages;
        
        // Always include these key messages
        const keyMessages = [];
        
        // First 2 messages
        keyMessages.push(...messages.slice(0, 2));
        
        // All billing@gep.com messages
        const billingMessages = messages.filter(m => 
            m.sender && m.sender.toLowerCase().includes('billing@gep.com')
        );
        
        // Add all billing messages (they're usually the important responses)
        billingMessages.forEach(msg => {
            if (!keyMessages.includes(msg)) {
                keyMessages.push(msg);
            }
        });
        
        // Last 2 messages
        const lastTwo = messages.slice(-2);
        lastTwo.forEach(msg => {
            if (!keyMessages.includes(msg)) {
                keyMessages.push(msg);
            }
        });
        
        // Sort by original order
        keyMessages.sort((a, b) => messages.indexOf(a) - messages.indexOf(b));
        
        return keyMessages;
    }

    // ENHANCED: Generate flow with NO TRUNCATION for full visibility
    // REVERSE the messages to show newest first
    const reversedMessages = [...decomposedMessages].reverse();
    const fullFlow = reversedMessages.map((m, idx) => {
        // NO TRUNCATION - Show full content
        return `  ${idx + 1}. [${m.timestamp || 'N/A'}] ${m.sender || 'Unknown'}: ${m.content || '(no content)'}`;
    }).join('\n');

    // For 'summary' field: Apply filtering for very large threads
    let flow;
    let usedMessages = decomposedMessages;
    
    if (fullFlow.length > 10000) { // Filter if conversation is very large
        // Filter messages but maintain reverse order
        usedMessages = filterMessagesForLongConversations(decomposedMessages, 10000);
        const reversedFiltered = [...usedMessages].reverse();
        flow = reversedFiltered.map((m, idx) => {
            return `  ${idx + 1}. [${m.timestamp || 'N/A'}] ${m.sender || 'Unknown'}: ${m.content || '(no content)'}`;
        }).join('\n');
        
        // Add note about filtered content
        flow += `\n  ... (Showing ${usedMessages.length} of ${decomposedMessages.length} messages - key messages only. See 'summary-full' for complete version)`;
    } else {
        flow = fullFlow;
    }

    const textAll = (usedMessages.map(m => `${m.subject}\n${m.content}`).join('\n') || '').toLowerCase();
    let status = 'General business communication';
    if (textAll.includes('approved') || textAll.includes('all good')) status = 'Approved / Closed';
    else if (textAll.includes('please approve') || textAll.includes('review')) status = 'Awaiting review/approval';
    else if (textAll.includes('rejection') || textAll.includes('reject')) status = 'Issue / Rejection noted';

    const mainSubject = decomposedMessages[0]?.subject || 'N/A';
    const summary = [
        `TIMELINE: ${startTime || 'N/A'} to ${endTime || 'N/A'} (${decomposedMessages.length} messages)`,
        `SUBJECTS: ${Array.from(subjects).join(' | ') || 'N/A'}`,
        `MAIN_SUBJECT: ${mainSubject}`,
        `KEY_SENDERS: ${Array.from(senders).join(', ') || 'N/A'}`,
        `KEY_TOPICS: ${Array.from(keyPhrases).join(', ') || 'N/A'}`,
        `PARTICIPANTS_BLOCKS:`,
        ...participantMarkdowns.map(md => '---\n' + md),
        `CONVERSATION_FLOW:`,
        flow || '  (no messages)',
        `CONVERSATION_STATUS: ${status}`
    ].join('\n');

    // Generate FULL version (without any filtering) - always use full flow
    const fullFlowUnfiltered = reversedMessages.map((m, idx) => {
        return `  ${idx + 1}. [${m.timestamp || 'N/A'}] ${m.sender || 'Unknown'}: ${m.content || '(no content)'}`;
    }).join('\n');
    
    const summaryFull = [
        `TIMELINE: ${startTime || 'N/A'} to ${endTime || 'N/A'} (${decomposedMessages.length} messages)`,
        `SUBJECTS: ${Array.from(subjects).join(' | ') || 'N/A'}`,
        `MAIN_SUBJECT: ${mainSubject}`,
        `KEY_SENDERS: ${Array.from(senders).join(', ') || 'N/A'}`,
        `KEY_TOPICS: ${Array.from(keyPhrases).join(', ') || 'N/A'}`,
        `PARTICIPANTS_BLOCKS:`,
        ...participantMarkdowns.map(md => '---\n' + md),
        `CONVERSATION_FLOW (COMPLETE - ALL MESSAGES):`,
        fullFlowUnfiltered || '  (no messages)',
        `CONVERSATION_STATUS: ${status}`
    ].join('\n');

    return {
        name,
        month,
        conversationId,
        subject: mainSubject,
        summary,
        'summary-full': summaryFull,
        firstEmailToBilling,
        firstResponseFromBilling,
        timeDelta,
        scope: threadType,
        timestamp: endTime,
        messageCount: decomposedMessages.length,
        status
    };
}

function generateSummaries(grouped, options = {}) {
    // ENHANCED: Configuration options
    const config = {
        maxSummaries: options.maxSummaries || 1000, // Show many more summaries
        sortOrder: options.sortOrder || 'newest-first', // 'newest-first' or 'oldest-first'
        includeStats: options.includeStats !== false, // Include overall statistics
        ...options
    };
    
    let groups = [];
    if (Array.isArray(grouped)) {
        const withGroups = grouped.find(g => g && Array.isArray(g.groups));
        groups = withGroups ? withGroups.groups : [];
    } else if (grouped && Array.isArray(grouped.groups)) {
        groups = grouped.groups;
    }
    // Generate summaries for all groups
    const summaries = groups.map(g => summarizeGroup(g));
    
    // Sort by timestamp
    summaries.sort((a, b) => {
        if (!a.timestamp && !b.timestamp) return 0;
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        
        // Parse timestamps for comparison
        const parseForSort = (ts) => {
            if (!ts) return null;
            const parts = ts.split(' - ');
            if (parts.length === 2) {
                const [datePart, timePart] = parts;
                const [day, month, year] = datePart.split('/');
                const [hours, minutes] = timePart.split(':');
                return new Date(year, month - 1, day, parseInt(hours), parseInt(minutes));
            }
            return null;
        };
        
        const dateA = parseForSort(a.timestamp);
        const dateB = parseForSort(b.timestamp);
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        // Sort based on configuration
        if (config.sortOrder === 'oldest-first') {
            return dateA.getTime() - dateB.getTime();
        } else {
            return dateB.getTime() - dateA.getTime(); // newest-first (default)
        }
    });
    
    // ENHANCED: Generate statistics
    let stats = null;
    if (config.includeStats) {
        const totalMessages = summaries.reduce((sum, s) => sum + (s.messageCount || 0), 0);
        const internalThreads = summaries.filter(s => s.scope === 'INTERNAL THREAD').length;
        const externalThreads = summaries.filter(s => s.scope === 'EXTERNAL THREAD').length;
        const withResponseTime = summaries.filter(s => s.timeDelta).length;
        
        // Calculate average response time
        const responseTimes = summaries
            .filter(s => s.timeDelta)
            .map(s => {
                const match = s.timeDelta.match(/(\d+)\s*Days?\s*:\s*(\d+)\s*Hours?\s*:\s*(\d+)\s*Min/);
                if (match) {
                    return parseInt(match[1]) * 1440 + parseInt(match[2]) * 60 + parseInt(match[3]);
                }
                const hourMatch = s.timeDelta.match(/(\d+)\s*Hours?\s*:\s*(\d+)\s*Min/);
                if (hourMatch) {
                    return parseInt(hourMatch[1]) * 60 + parseInt(hourMatch[2]);
                }
                const minMatch = s.timeDelta.match(/(\d+)\s*Min/);
                if (minMatch) {
                    return parseInt(minMatch[1]);
                }
                return 0;
            });
        
        const avgResponseMinutes = responseTimes.length > 0 
            ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
            : 0;
        
        const avgResponseFormatted = avgResponseMinutes > 0 
            ? `${Math.floor(avgResponseMinutes / 60)}h ${avgResponseMinutes % 60}m`
            : 'N/A';
        
        stats = {
            totalConversations: summaries.length,
            totalMessages,
            internalThreads,
            externalThreads,
            conversationsWithResponseTime: withResponseTime,
            averageResponseTime: avgResponseFormatted,
            sortOrder: config.sortOrder,
            statusBreakdown: {
                approved: summaries.filter(s => s.status && s.status.includes('Approved')).length,
                awaitingReview: summaries.filter(s => s.status && s.status.includes('Awaiting')).length,
                issues: summaries.filter(s => s.status && s.status.includes('Issue')).length,
                general: summaries.filter(s => !s.status || s.status.includes('General')).length
            }
        };
    }
    
    // Limit summaries if needed
    const limitedSummaries = summaries.slice(0, config.maxSummaries);
    
    // Prepare results
    const results = limitedSummaries.map(s => {
        const { timestamp, messageCount, status, ...rest } = s;
        return { 
            json: {
                ...rest,
                // metadata: {
                //     timestamp,
                //     messageCount,
                //     status
                // }
            }
        };
    });
    
    // Add stats to the beginning if enabled
    if (stats) {
        console.log('\n========== SUMMARY STATISTICS ==========');
        console.log(JSON.stringify(stats, null, 2));
        console.log('=========================================\n');
        
        results.unshift({
            json: {
                type: 'STATISTICS',
                stats
            }
        });
    }
    
    if (summaries.length > config.maxSummaries) {
        console.log(`Note: Showing ${config.maxSummaries} of ${summaries.length} total conversations`);
    }
    
    return results;
}

// ========== EXPORTS ==========

module.exports = {
  cleanEncodingIssues,
  cleanObjectEncodingRecursive,
  extractBillingResponseDataInline,
  calculateTimeDelta,
  truncate,
  extractSenderFromContent,
  extractSenderFromParticipants,
  summarizeGroup,
  generateSummaries
};

// ========== MAIN EXECUTION ==========

const data1 = $input.all().map(i => i.json || {});
const options = {
    maxSummaries: Infinity,
    sortOrder: 'newest-first',
    includeStats: false
};
const r = generateSummaries(data1, options);
return r;