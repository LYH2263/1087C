const { toCents } = require('./money');

const BOOK_SORT_MAP = {
  'price_asc': { priceCents: 'asc' },
  'price_desc': { priceCents: 'desc' },
  'sales_desc': { sales: 'desc' },
  'created_desc': { createdAt: 'desc' },
  'created_asc': { createdAt: 'asc' },
  'title_asc': { title: 'asc' },
  'title_desc': { title: 'desc' }
};

const DEFAULT_BOOK_ORDER_BY = { createdAt: 'desc' };

function buildBookWhere(query, options = {}) {
  const {
    title,
    author,
    isbn,
    categoryId,
    minPrice,
    maxPrice,
    status,
    keyword
  } = query;

  const {
    defaultStatus = null
  } = options;

  const where = {};

  if (defaultStatus) {
    where.status = defaultStatus;
  }

  if (status !== undefined && status !== '') {
    where.status = String(status);
  }

  if (keyword) {
    const kw = String(keyword);
    where.OR = [
      { title: { contains: kw, mode: 'insensitive' } },
      { author: { contains: kw, mode: 'insensitive' } },
      { isbn: { contains: kw, mode: 'insensitive' } }
    ];
  } else {
    if (title) {
      where.title = { contains: String(title), mode: 'insensitive' };
    }

    if (author) {
      where.author = { contains: String(author), mode: 'insensitive' };
    }

    if (isbn) {
      where.isbn = { contains: String(isbn), mode: 'insensitive' };
    }
  }

  if (categoryId) {
    where.categoryId = String(categoryId);
  }

  const min = toCents(minPrice);
  const max = toCents(maxPrice);

  if (min !== null || max !== null) {
    where.priceCents = {};
    if (min !== null) {
      where.priceCents.gte = min;
    }
    if (max !== null) {
      where.priceCents.lte = max;
    }
  }

  return where;
}

function buildBookOrderBy(sort) {
  if (!sort) {
    return { ...DEFAULT_BOOK_ORDER_BY };
  }
  const orderBy = BOOK_SORT_MAP[String(sort)];
  return orderBy ? { ...orderBy } : { ...DEFAULT_BOOK_ORDER_BY };
}

module.exports = {
  BOOK_SORT_MAP,
  DEFAULT_BOOK_ORDER_BY,
  buildBookWhere,
  buildBookOrderBy
};
