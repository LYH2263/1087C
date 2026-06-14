const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function parsePaginationParams(query) {
  const pageRaw = query.page;
  const pageSizeRaw = query.pageSize;

  let page = pageRaw === undefined ? null : Number(pageRaw);
  let pageSize = pageSizeRaw === undefined ? null : Number(pageSizeRaw);

  if (page !== null && (!Number.isInteger(page) || page < 1)) {
    page = DEFAULT_PAGE;
  }
  if (pageSize !== null && (!Number.isInteger(pageSize) || pageSize < 1)) {
    pageSize = DEFAULT_PAGE_SIZE;
  }
  if (pageSize !== null && pageSize > MAX_PAGE_SIZE) {
    pageSize = MAX_PAGE_SIZE;
  }

  const hasPagination = page !== null || pageSize !== null;

  return {
    page: page ?? DEFAULT_PAGE,
    pageSize: pageSize ?? DEFAULT_PAGE_SIZE,
    skip: hasPagination ? ((page ?? DEFAULT_PAGE) - 1) * (pageSize ?? DEFAULT_PAGE_SIZE) : undefined,
    take: hasPagination ? (pageSize ?? DEFAULT_PAGE_SIZE) : undefined,
    hasPagination
  };
}

function buildPaginationResult(items, total, pagination) {
  const { page, pageSize, hasPagination } = pagination;

  if (!hasPagination) {
    return items;
  }

  const totalPages = Math.ceil(total / pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

async function paginateQuery(prismaModel, queryOptions, pagination) {
  const { skip, take, hasPagination } = pagination;

  if (!hasPagination) {
    const items = await prismaModel.findMany(queryOptions);
    return { items, total: items.length, pagination };
  }

  const [items, total] = await Promise.all([
    prismaModel.findMany({
      ...queryOptions,
      skip,
      take
    }),
    prismaModel.count({
      where: queryOptions.where
    })
  ]);

  return { items, total, pagination };
}

module.exports = {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  parsePaginationParams,
  buildPaginationResult,
  paginateQuery
};
