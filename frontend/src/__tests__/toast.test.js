import { describe, it, expect } from 'vitest'
import { toChineseToast } from '../utils/toast'

describe('toChineseToast 文案映射', () => {
  describe('命中各类错误关键词', () => {
    it('network 类错误映射为网络请求失败', () => {
      expect(toChineseToast('Network error')).toBe('网络请求失败，请检查连接')
      expect(toChineseToast('Failed to fetch')).toBe('网络请求失败，请检查连接')
      expect(toChineseToast('fetch failed')).toBe('网络请求失败，请检查连接')
      expect(toChineseToast('timeout')).toBe('网络请求失败，请检查连接')
    })

    it('认证类错误映射为账号或密码错误', () => {
      expect(toChineseToast('Invalid credentials')).toBe('账号或密码错误')
      expect(toChineseToast('invalid password')).toBe('账号或密码错误')
      expect(toChineseToast('Unauthorized')).toBe('账号或密码错误')
      expect(toChineseToast('Invalid token')).toBe('账号或密码错误')
    })

    it('用户名已存在类错误', () => {
      expect(toChineseToast('Username exists')).toBe('用户名已被占用')
      expect(toChineseToast('username_exists')).toBe('用户名已被占用')
    })

    it('邮箱已存在类错误', () => {
      expect(toChineseToast('Email exists')).toBe('邮箱已被占用')
      expect(toChineseToast('email_exists')).toBe('邮箱已被占用')
    })

    it('手机号已存在类错误', () => {
      expect(toChineseToast('Phone exists')).toBe('手机号已被占用')
      expect(toChineseToast('phone_exists')).toBe('手机号已被占用')
    })

    it('账号已存在类错误', () => {
      expect(toChineseToast('Account exists')).toBe('账号已存在')
      expect(toChineseToast('User exists')).toBe('账号已存在')
      expect(toChineseToast('Already exists')).toBe('账号已存在')
    })

    it('校验失败类错误', () => {
      expect(toChineseToast('validation_error')).toBe('提交信息不完整或格式有误')
      expect(toChineseToast('输入校验失败')).toBe('提交信息不完整或格式有误')
    })

    it('未找到数据类错误', () => {
      expect(toChineseToast('Not found')).toBe('未找到相关数据')
      expect(toChineseToast('book not found')).toBe('未找到相关数据')
    })

    it('库存不足', () => {
      expect(toChineseToast('Insufficient stock')).toBe('库存不足')
    })

    it('购物车为空', () => {
      expect(toChineseToast('Cart empty')).toBe('当前购物车为空,请到书籍查询页面购买书籍.')
      expect(toChineseToast('cart_empty')).toBe('当前购物车为空,请到书籍查询页面购买书籍.')
    })

    it('订单状态不匹配', () => {
      expect(toChineseToast('Order not found')).toBe('订单状态不匹配，请刷新后重试')
      expect(toChineseToast('order not payable')).toBe('该订单当前不可支付')
    })

    it('订单不可支付', () => {
      expect(toChineseToast('order_not_payable')).toBe('该订单当前不可支付')
    })

    it('地址未找到', () => {
      expect(toChineseToast('Address not found')).toBe('未找到收货地址')
    })

    it('分类已存在', () => {
      expect(toChineseToast('Category exists')).toBe('分类已存在')
    })

    it('书籍已存在', () => {
      expect(toChineseToast('Book exists')).toBe('书籍已存在')
    })

    it('文件类型错误', () => {
      expect(toChineseToast('invalid_file_type')).toBe('仅支持 JPG/PNG/WEBP/GIF/SVG 格式图片')
    })

    it('文件过大', () => {
      expect(toChineseToast('file_too_large')).toBe('图片大小不能超过 2MB')
    })

    it('权限不足', () => {
      expect(toChineseToast('Forbidden')).toBe('没有权限执行该操作')
    })

    it('服务器内部错误', () => {
      expect(toChineseToast('Internal server error')).toBe('服务器开小差了，请稍后再试')
    })
  })

  describe('大小写不敏感匹配', () => {
    it('全部大写也能命中', () => {
      expect(toChineseToast('NETWORK ERROR')).toBe('网络请求失败，请检查连接')
      expect(toChineseToast('NOT FOUND')).toBe('未找到相关数据')
    })

    it('混合大小写也能命中', () => {
      expect(toChineseToast('NeTwOrK ErRoR')).toBe('网络请求失败，请检查连接')
    })
  })

  describe('已是中文直接返回', () => {
    it('纯中文消息直接返回', () => {
      expect(toChineseToast('操作成功')).toBe('操作成功')
      expect(toChineseToast('自定义错误信息')).toBe('自定义错误信息')
      expect(toChineseToast('这是一条中文提示')).toBe('这是一条中文提示')
    })

    it('中文开头的消息直接返回', () => {
      expect(toChineseToast('中文开头 with English')).toBe('中文开头 with English')
    })
  })

  describe('未命中返回兜底文案', () => {
    it('普通英文错误返回兜底文案', () => {
      expect(toChineseToast('Something went wrong')).toBe('操作失败，请检查输入或稍后再试')
      expect(toChineseToast('Unknown error')).toBe('操作失败，请检查输入或稍后再试')
    })

    it('数字开头的消息返回兜底文案', () => {
      expect(toChineseToast('123 error occurred')).toBe('操作失败，请检查输入或稍后再试')
    })

    it('符号开头的消息返回兜底文案', () => {
      expect(toChineseToast('!@# error')).toBe('操作失败，请检查输入或稍后再试')
    })
  })

  describe('空值/假值处理', () => {
    it('null 返回默认失败文案', () => {
      expect(toChineseToast(null)).toBe('操作失败，请稍后再试')
    })

    it('undefined 返回默认失败文案', () => {
      expect(toChineseToast(undefined)).toBe('操作失败，请稍后再试')
    })

    it('空字符串返回默认失败文案', () => {
      expect(toChineseToast('')).toBe('操作失败，请稍后再试')
    })

    it('0 返回默认失败文案', () => {
      expect(toChineseToast(0)).toBe('操作失败，请稍后再试')
    })

    it('false 返回默认失败文案', () => {
      expect(toChineseToast(false)).toBe('操作失败，请稍后再试')
    })
  })
})
