import mongoose from 'mongoose';

export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    next();
  };
};

export default validateObjectId;
