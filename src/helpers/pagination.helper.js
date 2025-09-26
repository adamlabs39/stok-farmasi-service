export function getPagination(query) {
  const page = query.page ? parseInt(query.page, 10) : 1;
  const pageSize = query.page_size ? parseInt(query.page_size, 10) : 10;

  return {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    page,
    pageSize,
  };
}

export function getPagingData(result, page, pageSize) {
  const { count, rows } = result;
  const totalPages = Math.ceil(count / pageSize);

  return {
    rows,
    count,
    page,
    pageSize,
    totalPages,
  };
}
