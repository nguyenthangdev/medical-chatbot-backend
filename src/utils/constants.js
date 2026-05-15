import ms from 'ms'

const isProduction = process.env.NODE_ENV === 'production'

export const getCookieOptions = (duration = '14d') => ({
  httpOnly: true, // Chống XSS
  secure: isProduction, // Chỉ bật True khi là HTTPS (Production)
  sameSite: isProduction ? ('none') : ('lax'), // 'none' cho HTTPS, 'lax' cho localhost
  maxAge: ms(duration),
  path: '/'
})

export const allPermissions = [
  "users_view", "users_edit", "users_delete",
  "accounts_view", "accounts_create", "accounts_edit", "accounts_delete",
  "roles_view", "roles_create", "roles_edit", "roles_delete", "roles_permissions",
  "conversations_view", "conversations_delete", "conversations_edit",
  "chats_view", "chats_delete", "chats_edit", "settings_edit"
];