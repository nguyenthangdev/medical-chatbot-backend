import ms from 'ms'

const isProduction = process.env.NODE_ENV === 'production'

export const getCookieOptions = (duration = '14d') => ({
  httpOnly: true, // Chống XSS
  secure: isProduction, // Chỉ bật True khi là HTTPS (Production)
  sameSite: isProduction ? ('none') : ('lax'), // 'none' cho HTTPS, 'lax' cho localhost
  maxAge: ms(duration),
  path: '/'
})