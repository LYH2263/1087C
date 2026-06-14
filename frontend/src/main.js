import './styles.css'
import { api } from './api'
import { state, normalizeBookSearch, escapeHtmlAttr } from './state'
import { createViewController } from './views/view-controller'
import { bindEventHandlers } from './handlers/event-binders'
import { toChineseToast } from './utils/toast'

const viewContent = document.getElementById('view-content')
const viewTitle = document.getElementById('view-title')
const modal = document.getElementById('modal')
const toastHost = document.getElementById('toast')
const loginBtn = document.getElementById('login-btn')
const logoutBtn = document.getElementById('logout-btn')
const userChip = document.getElementById('user-chip')
const adminNavBtn = document.querySelector('[data-view="admin"]')
const adminNavSection = document.getElementById('admin-nav')

document.querySelectorAll('.nav-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    setView(btn.dataset.view)
  })
})

function showToast(message, type = 'info') {
  const el = document.createElement('div')
  const color =
    type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-emerald-500' : 'bg-slate-800'
  el.className = `text-white px-4 py-2 rounded-xl shadow-lg text-sm ${color}`
  el.textContent = toChineseToast(message)
  toastHost.appendChild(el)
  setTimeout(() => {
    el.remove()
  }, 2000)
}

function openModal(content) {
  modal.innerHTML = `
    <div class="card w-full max-w-lg p-6 relative">
      <button class="absolute right-4 top-4 text-slate-400 hover:text-slate-700" data-action="close-modal">✕</button>
      ${content}
    </div>
  `
  modal.classList.remove('hidden')
  modal.classList.add('flex')
}

function closeModal() {
  modal.classList.add('hidden')
  modal.classList.remove('flex')
  modal.innerHTML = ''
}

const { updateAuthUI, safeRender } = createViewController({
  state,
  viewContent,
  viewTitle,
  loginBtn,
  logoutBtn,
  userChip,
  adminNavBtn,
  adminNavSection,
  escapeHtmlAttr,
  showToast
})

async function loadBooks(params = {}) {
  if (
    params.title !== undefined ||
    params.author !== undefined ||
    params.isbn !== undefined ||
    params.categoryId !== undefined ||
    params.sort !== undefined ||
    params.minPrice !== undefined ||
    params.maxPrice !== undefined
  ) {
    state.bookSearch = normalizeBookSearch(params)
    state.bookPagination.page = 1
  }
  state.loading.books = true
  safeRender()
  const result = await api.getBooks({
    ...state.bookSearch,
    page: state.bookPagination.page,
    pageSize: state.bookPagination.pageSize
  })
  state.books = result.items
  state.bookPagination = {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    totalPages: result.totalPages,
    hasNext: result.hasNext,
    hasPrev: result.hasPrev
  }
  state.loading.books = false
  safeRender()
}

async function loadCategories() {
  state.categories = await api.getCategories()
}

async function loadCart() {
  if (!state.user) {
    return
  }
  state.cart = await api.getCart()
}

async function loadOrders() {
  if (!state.user) {
    return
  }
  const result = await api.getOrders({
    page: state.orderPagination.page,
    pageSize: state.orderPagination.pageSize
  })
  state.orders = result.items
  state.orderPagination = {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    totalPages: result.totalPages,
    hasNext: result.hasNext,
    hasPrev: result.hasPrev
  }
}

async function loadAddresses() {
  if (!state.user) {
    return
  }
  state.addresses = await api.getAddresses()
}

async function loadAdminBooks() {
  if (!state.user || state.user.role !== 'ADMIN') {
    return
  }
  const result = await api.admin.getBooks({
    page: state.admin.bookPagination.page,
    pageSize: state.admin.bookPagination.pageSize
  })
  state.admin.books = result.items
  state.admin.bookPagination = {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    totalPages: result.totalPages,
    hasNext: result.hasNext,
    hasPrev: result.hasPrev
  }
}

async function loadAdminOrders() {
  if (!state.user || state.user.role !== 'ADMIN') {
    return
  }
  const result = await api.admin.getOrders({
    page: state.admin.orderPagination.page,
    pageSize: state.admin.orderPagination.pageSize
  })
  state.admin.orders = result.items
  state.admin.orderPagination = {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    totalPages: result.totalPages,
    hasNext: result.hasNext,
    hasPrev: result.hasPrev
  }
}

async function loadAdmin() {
  if (!state.user || state.user.role !== 'ADMIN') {
    return
  }
  state.loading.admin = true
  await Promise.all([
    loadAdminBooks(),
    loadAdminOrders(),
    api.admin.getCategories().then((cats) => {
      state.admin.categories = cats
    }),
    api.admin.getOrderStats().then((stats) => {
      state.admin.stats = stats
    })
  ])
  state.loading.admin = false
}

const viewLoaders = {
  books: async () => {
    await loadCategories()
    await loadBooks(state.bookSearch)
  },
  cart: async () => {
    await loadCart()
    await loadAddresses()
  },
  orders: loadOrders,
  profile: loadAddresses,
  admin: loadAdmin
}

async function setView(view) {
  state.view = view
  try {
    const loader = viewLoaders[view]
    if (loader) {
      await loader()
    }
  } catch (error) {
    showToast(error.message || '加载失败', 'error')
  }
  safeRender()
}

function openLoginModal() {
  openModal(`
    <div class="space-y-4">
      <h3 class="text-lg font-semibold">账号登录</h3>
      <form data-form="login" class="space-y-3" novalidate>
        <input class="input" name="account" placeholder="用户名 / 手机 / 邮箱" required />
        <input class="input" type="password" name="password" placeholder="密码" required />
        <label class="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" name="remember" /> 记住登录状态
        </label>
        <button class="btn-primary w-full" type="submit">登录</button>
      </form>
      <div class="flex justify-between text-sm">
        <button class="text-teal-700" data-action="show-register">注册新账号</button>
        <button class="text-teal-700" data-action="show-forgot">忘记密码</button>
      </div>
    </div>
  `)
}

function openRegisterModal() {
  openModal(`
    <div class="space-y-4">
      <h3 class="text-lg font-semibold">创建账号</h3>
      <form data-form="register" class="space-y-3" novalidate>
        <input class="input" name="username" placeholder="用户名" required />
        <input class="input" name="email" placeholder="邮箱" required />
        <input class="input" name="phone" placeholder="手机号" required />
        <input class="input" type="password" name="password" placeholder="密码 (含大小写 + 数字)" required />
        <button class="btn-primary w-full" type="submit">注册</button>
      </form>
      <button class="text-teal-700 text-sm" data-action="show-login">已有账号？登录</button>
    </div>
  `)
}

function openForgotModal() {
  openModal(`
    <div class="space-y-4">
      <h3 class="text-lg font-semibold">找回密码</h3>
      <form data-form="forgot" class="space-y-3" novalidate>
        <input class="input" name="account" placeholder="用户名 / 手机 / 邮箱" required />
        <div class="space-y-2">
          <p class="text-sm text-slate-600">选择验证码接收方式</p>
          <div class="grid grid-cols-2 gap-3" data-error-group="method">
            <label class="card p-3 flex items-center gap-2 cursor-pointer">
              <input type="radio" name="method" value="email" checked /> 邮箱
            </label>
            <label class="card p-3 flex items-center gap-2 cursor-pointer">
              <input type="radio" name="method" value="sms" /> 短信
            </label>
          </div>
        </div>
        <button class="btn-primary w-full" type="submit">发送验证码</button>
      </form>
      <button class="text-teal-700 text-sm" data-action="show-login">返回登录</button>
    </div>
  `)
}

function openResetModal(token = '') {
  openModal(`
    <div class="space-y-4">
      <h3 class="text-lg font-semibold">重置密码</h3>
      <form data-form="reset" class="space-y-3" novalidate>
        <input class="input" name="token" placeholder="请输入验证码" value="${token}" required />
        <input class="input" type="password" name="newPassword" placeholder="新密码" required />
        <button class="btn-primary w-full" type="submit">更新密码</button>
      </form>
    </div>
  `)
}

loginBtn.addEventListener('click', openLoginModal)
logoutBtn.addEventListener('click', async () => {
  await api.logout()
  api.clearToken()
  state.user = null
  updateAuthUI()
  showToast('已退出登录', 'success')
  await setView('books')
})

bindEventHandlers({
  state,
  api,
  modal,
  viewContent,
  showToast,
  updateAuthUI,
  setView,
  loadBooks,
  normalizeBookSearch,
  loadCart,
  loadOrders,
  loadAddresses,
  loadAdmin,
  loadAdminBooks,
  loadAdminOrders,
  safeRender,
  openModal,
  closeModal,
  openLoginModal,
  openRegisterModal,
  openForgotModal,
  openResetModal
})

async function bootstrap() {
  api.initToken()
  try {
    const me = await api.getMe()
    state.user = me
  } catch (error) {
    state.user = null
  }

  updateAuthUI()
  await setView('books')
}

bootstrap()
