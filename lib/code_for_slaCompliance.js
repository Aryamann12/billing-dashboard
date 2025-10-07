const data = require('./actual-mock-data.json');

// Helper function to parse time delta string to minutes
function parseTimeDeltaToMinutes(deltaStr) {
  if (!deltaStr || deltaStr === "No response yet") return null;
  
  const daysMatch = deltaStr.match(/(\d+)\s*Days?/);
  const hoursMatch = deltaStr.match(/(\d+)\s*Hours?/);
  const minMatch = deltaStr.match(/(\d+)\s*Min/);
  
  const days = daysMatch ? parseInt(daysMatch[1]) : 0;
  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minMatch ? parseInt(minMatch[1]) : 0;
  
  return days * 24 * 60 + hours * 60 + minutes;
}

// Helper function to format minutes to readable string
function formatMinutes(totalMinutes) {
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const mins = Math.floor(totalMinutes % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  
  return parts.length > 0 ? parts.join(' ') : '0m';
}

const analytics = {};
let overallStats = {
  noResponseCount: 0,
  totalEmails: 0,
  responseTimes: [],
  slaBreaches: 0,
  slaWithin: 0
};

// Process data
data.forEach(item => {
  const member = item.name;
  const tag = item.classification_tags || "UNCLASSIFIED";
  const sla = item.sla_status || "UNSPECIFIED";
  const delta = item.time_delta && item.time_delta.trim() !== "" ? item.time_delta : null;

  if (!analytics[member]) {
    analytics[member] = {
      tags: {},
      sla: {},
      timeDeltas: [],
      noResponseCount: 0,
      totalEmails: 0,
      responseTimes: []
    };
  }

  analytics[member].totalEmails++;
  overallStats.totalEmails++;

  // Count tags
  analytics[member].tags[tag] = (analytics[member].tags[tag] || 0) + 1;

  // Count SLA
  analytics[member].sla[sla] = (analytics[member].sla[sla] || 0) + 1;
  if (sla === "breached") {
    overallStats.slaBreaches++;
  } else if (sla === "within") {
    overallStats.slaWithin++;
  }

  // Process time delta
  if (delta === "No response yet") {
    analytics[member].noResponseCount++;
    overallStats.noResponseCount++;
  } else if (delta) {
    const minutes = parseTimeDeltaToMinutes(delta);
    if (minutes !== null) {
      analytics[member].timeDeltas.push(delta);
      analytics[member].responseTimes.push(minutes);
      overallStats.responseTimes.push(minutes);
    }
  }
});

// Calculate statistics for each member
Object.keys(analytics).forEach(member => {
  const details = analytics[member];
  
  if (details.responseTimes.length > 0) {
    const sum = details.responseTimes.reduce((a, b) => a + b, 0);
    details.avgResponseTime = sum / details.responseTimes.length;
    details.minResponseTime = Math.min(...details.responseTimes);
    details.maxResponseTime = Math.max(...details.responseTimes);
  }
  
  details.responseRate = details.totalEmails > 0 
    ? ((details.totalEmails - details.noResponseCount) / details.totalEmails * 100).toFixed(1)
    : 0;
});

// Calculate overall statistics
if (overallStats.responseTimes.length > 0) {
  const sum = overallStats.responseTimes.reduce((a, b) => a + b, 0);
  overallStats.avgResponseTime = sum / overallStats.responseTimes.length;
  overallStats.minResponseTime = Math.min(...overallStats.responseTimes);
  overallStats.maxResponseTime = Math.max(...overallStats.responseTimes);
}
overallStats.responseRate = overallStats.totalEmails > 0
  ? ((overallStats.totalEmails - overallStats.noResponseCount) / overallStats.totalEmails * 100).toFixed(1)
  : 0;

// --- Print results ---
console.log("═".repeat(70));
console.log("📊 TEAM EMAIL ANALYTICS REPORT");
console.log("═".repeat(70));

// Sort members by response rate (worst first)
const sortedMembers = Object.entries(analytics).sort((a, b) => {
  return parseFloat(a[1].responseRate) - parseFloat(b[1].responseRate);
});

sortedMembers.forEach(([member, details]) => {
  console.log(`\n${"─".repeat(70)}`);
  console.log(`👤 ${member.toUpperCase()}`);
  console.log(`${"─".repeat(70)}`);
  console.log(`   Total Emails: ${details.totalEmails}`);
  console.log(`   Response Rate: ${details.responseRate}% (${details.totalEmails - details.noResponseCount}/${details.totalEmails})`);
  console.log(`   ❌ No Response Yet: ${details.noResponseCount}`);
  
  if (details.responseTimes.length > 0) {
    console.log(`\n   ⏱️  Response Time Stats:`);
    console.log(`      Average: ${formatMinutes(details.avgResponseTime)}`);
    console.log(`      Fastest: ${formatMinutes(details.minResponseTime)}`);
    console.log(`      Slowest: ${formatMinutes(details.maxResponseTime)}`);
  }

  console.log(`\n   📋 Classification Tags:`);
  Object.entries(details.tags)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tag, count]) => {
      const percentage = (count / details.totalEmails * 100).toFixed(1);
      console.log(`      ${tag}: ${count} (${percentage}%)`);
    });

  console.log(`\n   ⚠️  SLA Status:`);
  Object.entries(details.sla)
    .sort((a, b) => b[1] - a[1])
    .forEach(([sla, count]) => {
      const percentage = (count / details.totalEmails * 100).toFixed(1);
      const icon = sla === "breached" ? "🔴" : sla === "within" ? "🟢" : "⚪";
      console.log(`      ${icon} ${sla}: ${count} (${percentage}%)`);
    });
});

console.log(`\n${"═".repeat(70)}`);
console.log("📈 OVERALL TEAM SUMMARY");
console.log(`${"═".repeat(70)}`);
console.log(`   Total Emails: ${overallStats.totalEmails}`);
console.log(`   Overall Response Rate: ${overallStats.responseRate}%`);
console.log(`   ❌ Total No Response Yet: ${overallStats.noResponseCount}`);
console.log(`   ✅ Total Responded: ${overallStats.totalEmails - overallStats.noResponseCount}`);

if (overallStats.responseTimes.length > 0) {
  console.log(`\n   ⏱️  Team Response Time Stats:`);
  console.log(`      Average: ${formatMinutes(overallStats.avgResponseTime)}`);
  console.log(`      Fastest: ${formatMinutes(overallStats.minResponseTime)}`);
  console.log(`      Slowest: ${formatMinutes(overallStats.maxResponseTime)}`);
}

console.log(`\n   ⚠️  SLA Performance:`);
console.log(`      🟢 Within SLA: ${overallStats.slaWithin} (${(overallStats.slaWithin/overallStats.totalEmails*100).toFixed(1)}%)`);
console.log(`      🔴 Breached: ${overallStats.slaBreaches} (${(overallStats.slaBreaches/overallStats.totalEmails*100).toFixed(1)}%)`);

console.log(`\n${"═".repeat(70)}`);
