// Custom NoSQL Query Injection Sanitizer
// Recursively strips keys starting with '$' or containing '.' from objects
const sanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  const cleanObj = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      continue; // Skip keys designed for NoSQL query injection
    }
    cleanObj[key] = sanitize(obj[key]);
  }
  return cleanObj;
};

const sanitizeNoSql = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitize(req.params);
  }
  next();
};

module.exports = sanitizeNoSql;
