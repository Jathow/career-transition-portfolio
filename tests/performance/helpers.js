// Helper functions for Artillery.js performance tests

function generateRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateRandomEmail() {
  return `${generateRandomString(8)}@loadtest.com`;
}

function generateRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Custom functions for Artillery
module.exports = {
  generateRandomString,
  generateRandomEmail,
  generateRandomDate,
  
  // Artillery custom functions
  $randomString: function(length = 8) {
    return generateRandomString(length);
  },
  
  $randomEmail: function() {
    return generateRandomEmail();
  },
  
  $isoTimestamp: function(offset = '') {
    const now = new Date();
    if (offset) {
      // Handle simple offsets like '+7d', '+1h', etc.
      const match = offset.match(/^\+(\d+)([dhms])$/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
          case 'd':
            now.setDate(now.getDate() + value);
            break;
          case 'h':
            now.setHours(now.getHours() + value);
            break;
          case 'm':
            now.setMinutes(now.getMinutes() + value);
            break;
          case 's':
            now.setSeconds(now.getSeconds() + value);
            break;
        }
      }
    }
    return now.toISOString();
  }
}; 