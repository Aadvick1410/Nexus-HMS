import AuditLog from '../models/AuditLog.js';

// Middleware to automatically log critical actions
// Mount this on specific routes that perform POST, PUT, DELETE operations
const logAction = (moduleName) => {
  return async (req, res, next) => {
    // Capture the original send to intercept the response completion
    const originalSend = res.send;
    
    res.send = function (body) {
      res.send = originalSend;
      res.send(body); // Send response to client

      // Check if request was successful before logging
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        
        let action = 'CREATE';
        if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
        if (req.method === 'DELETE') action = 'DELETE';

        // Save log asynchronously without blocking response
        AuditLog.create({
          userId: req.user._id,
          action,
          module: moduleName,
          metadata: {
            method: req.method,
            url: req.originalUrl,
            // In production, filter sensitive info like passwords
            body: { ...req.body, password: undefined },
          },
          ipAddress: req.ip || req.connection?.remoteAddress,
        }).catch(err => console.error('Failed to save audit log', err));
      }
    };
    next();
  };
};

export { logAction };
