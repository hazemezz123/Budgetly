import api from "../../../utils/api";

export const settlementsApi = {
  getSettlements: async () => {
    const { data } = await api.get("/settlements");
    return data;
  },

  createSettlement: async ({ creditorId, amount }) => {
    const { data } = await api.post("/settlements", { creditorId, amount });
    return data;
  },

  approveSettlement: async (id) => {
    const { data } = await api.put(`/settlements/${id}/approve`);
    return data;
  },

  rejectSettlement: async ({ id, reason = "" }) => {
    const { data } = await api.put(`/settlements/${id}/reject`, { reason });
    return data;
  },
};
