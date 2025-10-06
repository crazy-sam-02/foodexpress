// Generate a unique order ID that's consistent across the entire app
export const generateOrderId = (): string => {
  // Use timestamp + random number for uniqueness
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${timestamp}${random}`;
};
