const express = require('express');
const prisma = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { fromCents } = require('../utils/money');
const { ApiError } = require('../errors');
const { buildBookWhere, buildBookOrderBy } = require('../utils/bookQuery');
const { parsePaginationParams, buildPaginationResult, paginateQuery } = require('../utils/pagination');

const router = express.Router();

function mapBook(book) {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    description: book.description,
    price: fromCents(book.priceCents),
    stock: book.stock,
    coverUrl: book.coverUrl,
    sales: book.sales,
    status: book.status,
    category: book.category
  };
}

router.get('/', asyncHandler(async (req, res) => {
  const pagination = parsePaginationParams(req.query);
  const where = buildBookWhere(req.query, { defaultStatus: 'ACTIVE' });
  const orderBy = buildBookOrderBy(req.query.sort);

  const queryOptions = {
    where,
    include: { category: true },
    orderBy
  };

  const { items, total } = await paginateQuery(prisma.book, queryOptions, pagination);
  const mappedItems = items.map(mapBook);
  const result = buildPaginationResult(mappedItems, total, pagination);

  res.json(result);
}));

router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
  res.json(categories);
}));

router.get('/:id([a-z0-9]{25})', asyncHandler(async (req, res) => {
  const book = await prisma.book.findUnique({
    where: { id: req.params.id },
    include: { category: true }
  });

  if (!book || book.status !== 'ACTIVE') {
    throw new ApiError(404, 'BOOK_NOT_FOUND');
  }

  res.json(mapBook(book));
}));

module.exports = router;
