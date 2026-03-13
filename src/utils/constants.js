// src/utils/constants.js
export const getCookieOptions = (expiresIn) => {
  // Quy đổi string sang milliseconds cho thuộc tính maxAge của Cookie
  let maxAge = 60 * 60 * 1000; // Mặc định 1h ('1h')
  if (expiresIn === '14d') maxAge = 14 * 24 * 60 * 60 * 1000; // 14 ngày
  
  return {
    httpOnly: true, // Tránh tấn công XSS, không cho Javascript phía client đọc cookie
    secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS khi ở production
    sameSite: 'strict', // Tránh tấn công CSRF
    maxAge: maxAge
  };
};