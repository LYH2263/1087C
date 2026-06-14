const { toCents, fromCents } = require('../utils/money')

describe('money utils', () => {
  describe('toCents', () => {
    describe('正常值转换', () => {
      test('整数金额转换为分', () => {
        expect(toCents(10)).toBe(1000)
        expect(toCents(0)).toBe(0)
        expect(toCents(1)).toBe(100)
      })

      test('小数金额精确转换', () => {
        expect(toCents(9.99)).toBe(999)
        expect(toCents(12.34)).toBe(1234)
        expect(toCents(0.01)).toBe(1)
        expect(toCents(0.99)).toBe(99)
      })

      test('字符串数字正确转换', () => {
        expect(toCents('10')).toBe(1000)
        expect(toCents('9.99')).toBe(999)
        expect(toCents('12.34')).toBe(1234)
      })
    })

    describe('小数精度处理', () => {
      test('超过两位小数正确四舍五入', () => {
        expect(toCents(9.995)).toBe(1000)
        expect(toCents(9.994)).toBe(999)
        expect(toCents(0.005)).toBe(1)
        expect(toCents(0.004)).toBe(0)
      })

      test('浮点精度问题正确处理', () => {
        expect(toCents(0.1 + 0.2)).toBe(30)
        expect(toCents(19.99)).toBe(1999)
      })
    })

    describe('零值处理', () => {
      test('数字 0 返回 0', () => {
        expect(toCents(0)).toBe(0)
        expect(toCents(0.0)).toBe(0)
      })

      test('字符串 "0" 返回 0', () => {
        expect(toCents('0')).toBe(0)
        expect(toCents('0.00')).toBe(0)
      })
    })

    describe('空值处理', () => {
      test('undefined 返回 null', () => {
        expect(toCents(undefined)).toBeNull()
      })

      test('null 返回 null', () => {
        expect(toCents(null)).toBeNull()
      })

      test('空字符串返回 null', () => {
        expect(toCents('')).toBeNull()
      })
    })

    describe('非法输入', () => {
      test('非数字字符串返回 null', () => {
        expect(toCents('abc')).toBeNull()
        expect(toCents('12a34')).toBeNull()
        expect(toCents('NaN')).toBeNull()
      })

      test('NaN 返回 null', () => {
        expect(toCents(NaN)).toBeNull()
      })

      test('对象返回 null', () => {
        expect(toCents({})).toBeNull()
        expect(toCents([])).toBeNull()
      })

      test('布尔值特殊处理', () => {
        expect(toCents(true)).toBe(100)
        expect(toCents(false)).toBe(0)
      })
    })

    describe('负数处理', () => {
      test('负整数正确转换', () => {
        expect(toCents(-10)).toBe(-1000)
        expect(toCents(-1)).toBe(-100)
      })

      test('负小数正确转换', () => {
        expect(toCents(-9.99)).toBe(-999)
        expect(toCents(-0.01)).toBe(-1)
      })

      test('负数字符串正确转换', () => {
        expect(toCents('-9.99')).toBe(-999)
      })
    })

    describe('大额数值', () => {
      test('大整数金额正确转换', () => {
        expect(toCents(999999)).toBe(99999900)
        expect(toCents(1000000)).toBe(100000000)
      })

      test('大额带小数正确转换', () => {
        expect(toCents(999999.99)).toBe(99999999)
        expect(toCents(1234567.89)).toBe(123456789)
      })
    })
  })

  describe('fromCents', () => {
    describe('正常值转换', () => {
      test('整数分转换为元', () => {
        expect(fromCents(100)).toBe(1)
        expect(fromCents(0)).toBe(0)
        expect(fromCents(999)).toBe(9.99)
        expect(fromCents(1234)).toBe(12.34)
      })

      test('1分转换为0.01', () => {
        expect(fromCents(1)).toBe(0.01)
        expect(fromCents(99)).toBe(0.99)
      })
    })

    describe('负数处理', () => {
      test('负分数正确转换', () => {
        expect(fromCents(-100)).toBe(-1)
        expect(fromCents(-999)).toBe(-9.99)
        expect(fromCents(-1)).toBe(-0.01)
      })
    })

    describe('大额数值', () => {
      test('大额分数正确转换', () => {
        expect(fromCents(99999900)).toBe(999999)
        expect(fromCents(100000000)).toBe(1000000)
        expect(fromCents(123456789)).toBe(1234567.89)
      })
    })
  })

  describe('往返转换一致性', () => {
    test('toCents -> fromCents 往返保持一致', () => {
      const testCases = [0, 0.01, 0.99, 1, 9.99, 12.34, 99.99, 100, 999.99, -0.01, -9.99, -100]
      testCases.forEach((amount) => {
        const cents = toCents(amount)
        const result = fromCents(cents)
        expect(result).toBe(amount)
      })
    })

    test('fromCents -> toCents 往返保持一致', () => {
      const testCases = [0, 1, 99, 100, 999, 1234, 99999900, -1, -999, -10000]
      testCases.forEach((cents) => {
        const amount = fromCents(cents)
        const result = toCents(amount)
        expect(result).toBe(cents)
      })
    })
  })
})
