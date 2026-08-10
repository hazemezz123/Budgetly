
export const queryKeys = {
  houses: {
    all: ["houses"],
  },
  users: {
    all: ["users"],
    current: ["user"],
  },
  expenses: {
    all: ["expenses"],
    list: (page, selectedUserId) => ["expenses", page, selectedUserId],
    pendingRequests: ["pendingRequests"],
  },
  myPayments: {
    all: ["myPayments"],
  },
  income: {
    allPayments: ["allPaymentsForIncome"],
  },
  budgets: {
    all: ["budgets"],
  },
  myInvoices: {
    all: ["myInvoices"],
    byUser: (userId) => ["myInvoices", userId],
  },
  myRequests: {
    all: ["myRequests"],
    byUser: (userId) => ["myRequests", userId],
  },
  allInvoices: {
    all: ["allInvoices"],
  },
  profileStats: {
    byUser: (userId) => ["profileStats", userId],
  },
  dashboardStats: {
    byUserRole: (userId, role) => ["dashboardStats", userId, role],
  },
  ai: {
    chats: ["aiChats"],
    chat: (chatId) => ["aiChat", chatId],
  },
  roleRotation: {
    all: (houseId) => ["roleRotation", houseId],
    settings: (houseId) => ["roleRotation", houseId, "settings"],
    current: (houseId) => ["roleRotation", houseId, "current"],
    history: (houseId) => ["roleRotation", houseId, "history"],
  },
  house: {
    byId: (houseId) => ["house", houseId],
  },
  notes: {
    all: ["notes"],
  },
  analytics: {
    all: ["analytics"],
  },
};
