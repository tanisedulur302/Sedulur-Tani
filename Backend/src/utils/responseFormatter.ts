export const successResponse = (message: string, data?: any) => {
  return {
    success: true,
    message,
    ...(data && { data })
  };
};

export const errorResponse = (message: string, error?: any) => {
  return {
    success: false,
    message,
    ...(error && { error })
  };
};
