import unidecode from 'unidecode'

export const convertToSlug = (text) => {
  const unidecodeText = unidecode(text.trim())
  
  const slug = unidecodeText.replace(/\s+/g, '-')
  return slug
}

export const convertToFullName = (text) => {
  const unidecodeText = unidecode(text.trim())
  
  const fullName = unidecodeText.replace(/\s+/g, '-')
  return fullName
}