import { convertToSlug } from "./convertToSlug.js";

const searchHelpers = (query) => {
  const objectSearch = {
    keyword: ''
  };

  if (query.keyword) {
    if (typeof query.keyword === 'string') {  
      objectSearch.keyword = query.keyword.trim();
      const stringSlug = convertToSlug(query.keyword);
      
      // Không sử dụng global (g) do sẽ có sự luân phiên true/false khi hàm test chạy
      objectSearch.regex = new RegExp(objectSearch.keyword, 'i');
      objectSearch.slug = new RegExp(stringSlug, 'i');
    }
  }

  return objectSearch;
};

export default searchHelpers;