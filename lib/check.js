const data=require('./actual-mock-data-old.json')
const hasLongerFullSummary = data.some(
  item => (item.summary_full && item.summary) && item.summary_full.length > item.summary.length
);
data.forEach(item => {
  if (item.summary_full && item.summary) {
    console.log(`convID: ${item.convID} | summary_full length: ${item.summary_full.length} | summary length: ${item.summary.length}`);
  }
});
console.log('Any summary_full longer than summary?', hasLongerFullSummary);
