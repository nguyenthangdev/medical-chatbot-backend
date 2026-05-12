const paginationHelpers = (objectPagination, query, countItems) => {
  if (query.page) {
    if (typeof query.page === 'string' || typeof query.page === 'number') {
      objectPagination.currentPage = parseInt(query.page);
    }
  }
  objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems;
  const totalPage = Math.ceil(countItems / objectPagination.limitItems);

  objectPagination.totalPage = totalPage;
  objectPagination.totalItems = countItems;
  
  return objectPagination;
};

export default paginationHelpers;