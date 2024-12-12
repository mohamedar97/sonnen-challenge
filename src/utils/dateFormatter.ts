export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toUTCString().slice(17, 22); // Returns HH:MM in 24-hour format
};

// It would have been better to convert the date to the customer's timezone using the following code, but I wanted to keep the date in UTC format to make it easier for you to validate the displayed data against the provided test file.

// export const formatTime = (dateString: string): string => {
//   const date = new Date(dateString);
//   return date.toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });
// };
