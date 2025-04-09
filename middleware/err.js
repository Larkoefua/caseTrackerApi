const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
  
  const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    
    // Handle specific error types
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid ID format',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }

    // Default error handling
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };
  
  export { notFound, errorHandler };