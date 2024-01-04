export function generateUniqueID(username:String) {
    const randomDigits = Math.floor(Math.random() * 10000); // Generate random 4-digit number
    const timestamp = Date.now(); // Get current timestamp
    
    const uniqueID = `${username}_${randomDigits}_${timestamp}`;
    return uniqueID;
  }


