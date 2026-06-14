const toastMap = [
  [/(network|fetch|failed to fetch|timeout)/i, '网络请求失败，请检查连接'],
  [/invalid credentials|invalid password|unauthorized|invalid token/i, '账号或密码错误'],
  [/username exists|username_exists/i, '用户名已被占用'],
  [/email exists|email_exists/i, '邮箱已被占用'],
  [/phone exists|phone_exists/i, '手机号已被占用'],
  [/account exists|user exists|already exists/i, '账号已存在'],
  [/validation_error|输入校验失败/i, '提交信息不完整或格式有误'],
  [/not found/i, '未找到相关数据'],
  [/insufficient stock/i, '库存不足'],
  [/cart empty|cart_empty/i, '当前购物车为空,请到书籍查询页面购买书籍.'],
  [/order not/gi, '订单状态不匹配，请刷新后重试'],
  [/order not payable|order_not_payable/i, '该订单当前不可支付'],
  [/address not found/i, '未找到收货地址'],
  [/category exists/i, '分类已存在'],
  [/book exists/i, '书籍已存在'],
  [/invalid_file_type/i, '仅支持 JPG/PNG/WEBP/GIF/SVG 格式图片'],
  [/file_too_large/i, '图片大小不能超过 2MB'],
  [/forbidden/i, '没有权限执行该操作'],
  [/internal server error/i, '服务器开小差了，请稍后再试']
]

export function toChineseToast(message) {
  if (!message) {
    return '操作失败，请稍后再试'
  }
  const found = toastMap.find(([regex]) => regex.test(message))
  if (found) {
    return found[1]
  }
  if (/^[\u4e00-\u9fa5]/.test(message)) {
    return message
  }
  return '操作失败，请检查输入或稍后再试'
}

export { toastMap }
