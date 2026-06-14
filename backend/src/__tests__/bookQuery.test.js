const { buildBookWhere, buildBookOrderBy, DEFAULT_BOOK_ORDER_BY } = require('../utils/bookQuery')

describe('bookQuery utils', () => {
  describe('buildBookWhere - priceCents 条件', () => {
    test('仅 minPrice 时附加 gte 条件', () => {
      const where = buildBookWhere({ minPrice: '10' })
      expect(where.priceCents).toBeDefined()
      expect(where.priceCents.gte).toBe(1000)
      expect(where.priceCents.lte).toBeUndefined()
    })

    test('仅 maxPrice 时附加 lte 条件', () => {
      const where = buildBookWhere({ maxPrice: '100' })
      expect(where.priceCents).toBeDefined()
      expect(where.priceCents.lte).toBe(10000)
      expect(where.priceCents.gte).toBeUndefined()
    })

    test('minPrice 和 maxPrice 皆有时同时附加 gte 和 lte', () => {
      const where = buildBookWhere({ minPrice: '10', maxPrice: '100' })
      expect(where.priceCents).toEqual({ gte: 1000, lte: 10000 })
    })

    test('minPrice 和 maxPrice 皆空时不附加 priceCents 条件', () => {
      const where = buildBookWhere({})
      expect(where.priceCents).toBeUndefined()
    })

    test('minPrice 为空字符串和 maxPrice 为 undefined 时不附加 priceCents 条件', () => {
      const where = buildBookWhere({ minPrice: '', maxPrice: undefined })
      expect(where.priceCents).toBeUndefined()
    })

    test('minPrice 为 null 时不附加 gte', () => {
      const where = buildBookWhere({ minPrice: null, maxPrice: '50' })
      expect(where.priceCents.gte).toBeUndefined()
      expect(where.priceCents.lte).toBe(5000)
    })

    test('maxPrice 为非法值时仅附加 minPrice 的 gte', () => {
      const where = buildBookWhere({ minPrice: '10', maxPrice: 'abc' })
      expect(where.priceCents.gte).toBe(1000)
      expect(where.priceCents.lte).toBeUndefined()
    })
  })

  describe('buildBookWhere - status 条件', () => {
    test('不传入 defaultStatus 且未指定 status 时不附加 status', () => {
      const where = buildBookWhere({})
      expect(where.status).toBeUndefined()
    })

    test('传入 defaultStatus 时附加默认 status', () => {
      const where = buildBookWhere({}, { defaultStatus: 'ACTIVE' })
      expect(where.status).toBe('ACTIVE')
    })

    test('显式指定 status 时覆盖 defaultStatus', () => {
      const where = buildBookWhere({ status: 'INACTIVE' }, { defaultStatus: 'ACTIVE' })
      expect(where.status).toBe('INACTIVE')
    })

    test('status 为空字符串时使用 defaultStatus', () => {
      const where = buildBookWhere({ status: '' }, { defaultStatus: 'ACTIVE' })
      expect(where.status).toBe('ACTIVE')
    })
  })

  describe('buildBookWhere - title/author 模糊查询', () => {
    test('title 参数构造 contains + insensitive', () => {
      const where = buildBookWhere({ title: '三体' })
      expect(where.title).toEqual({ contains: '三体', mode: 'insensitive' })
    })

    test('author 参数构造 contains + insensitive', () => {
      const where = buildBookWhere({ author: '刘慈欣' })
      expect(where.author).toEqual({ contains: '刘慈欣', mode: 'insensitive' })
    })

    test('title 和 author 同时存在时各自独立构造', () => {
      const where = buildBookWhere({ title: '三体', author: '刘慈欣' })
      expect(where.title).toEqual({ contains: '三体', mode: 'insensitive' })
      expect(where.author).toEqual({ contains: '刘慈欣', mode: 'insensitive' })
    })

    test('isbn 参数也构造 contains + insensitive', () => {
      const where = buildBookWhere({ isbn: '9787' })
      expect(where.isbn).toEqual({ contains: '9787', mode: 'insensitive' })
    })
  })

  describe('buildBookWhere - keyword 综合搜索', () => {
    test('keyword 存在时构造 OR 条件覆盖 title/author/isbn', () => {
      const where = buildBookWhere({ keyword: '刘慈欣' })
      expect(where.OR).toBeDefined()
      expect(where.OR).toHaveLength(3)
      expect(where.OR[0]).toEqual({ title: { contains: '刘慈欣', mode: 'insensitive' } })
      expect(where.OR[1]).toEqual({ author: { contains: '刘慈欣', mode: 'insensitive' } })
      expect(where.OR[2]).toEqual({ isbn: { contains: '刘慈欣', mode: 'insensitive' } })
    })

    test('keyword 存在时忽略单独的 title 参数', () => {
      const where = buildBookWhere({ keyword: '科幻', title: '三体' })
      expect(where.title).toBeUndefined()
      expect(where.OR).toBeDefined()
    })
  })

  describe('buildBookWhere - categoryId', () => {
    test('categoryId 存在时附加条件', () => {
      const where = buildBookWhere({ categoryId: 'cat123' })
      expect(where.categoryId).toBe('cat123')
    })

    test('categoryId 不存在时不附加条件', () => {
      const where = buildBookWhere({})
      expect(where.categoryId).toBeUndefined()
    })
  })

  describe('buildBookOrderBy - sort 映射', () => {
    test('未指定 sort 时返回默认排序', () => {
      expect(buildBookOrderBy(undefined)).toEqual({ ...DEFAULT_BOOK_ORDER_BY })
      expect(buildBookOrderBy(null)).toEqual({ ...DEFAULT_BOOK_ORDER_BY })
      expect(buildBookOrderBy('')).toEqual({ ...DEFAULT_BOOK_ORDER_BY })
    })

    test('price_asc 映射为 priceCents 升序', () => {
      expect(buildBookOrderBy('price_asc')).toEqual({ priceCents: 'asc' })
    })

    test('price_desc 映射为 priceCents 降序', () => {
      expect(buildBookOrderBy('price_desc')).toEqual({ priceCents: 'desc' })
    })

    test('sales_desc 映射为 sales 降序', () => {
      expect(buildBookOrderBy('sales_desc')).toEqual({ sales: 'desc' })
    })

    test('created_desc 映射为 createdAt 降序', () => {
      expect(buildBookOrderBy('created_desc')).toEqual({ createdAt: 'desc' })
    })

    test('created_asc 映射为 createdAt 升序', () => {
      expect(buildBookOrderBy('created_asc')).toEqual({ createdAt: 'asc' })
    })

    test('title_asc 映射为 title 升序', () => {
      expect(buildBookOrderBy('title_asc')).toEqual({ title: 'asc' })
    })

    test('title_desc 映射为 title 降序', () => {
      expect(buildBookOrderBy('title_desc')).toEqual({ title: 'desc' })
    })

    test('未知 sort 值返回默认排序', () => {
      expect(buildBookOrderBy('invalid_sort')).toEqual({ ...DEFAULT_BOOK_ORDER_BY })
      expect(buildBookOrderBy('random')).toEqual({ ...DEFAULT_BOOK_ORDER_BY })
    })

    test('返回的是新对象引用而非原对象', () => {
      const result1 = buildBookOrderBy(undefined)
      const result2 = buildBookOrderBy(undefined)
      expect(result1).not.toBe(result2)
    })
  })
})
