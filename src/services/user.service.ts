import type { AxiosResponse } from "axios";
import { request } from "@/helpers/request.helper";
import type {
  UserListResponse,
  AccountType,
  IndicativeBalance,
} from "@/types/user.type";

/**
 * Typage dédié au service users (données non génériques, cf. §1 de la doc API).
 */
export type UserServiceProps = {
  /** GET /api/users?size= */
  fetchAll: (size?: number) => Promise<AxiosResponse<UserListResponse>>;
  /** GET /api/users/:clientId/accounts */
  fetchAccounts: (clientId: string) => Promise<AxiosResponse<AccountType[]>>;
  /** GET /api/users/accounts/:accountId/indicative-balance */
  fetchIndicativeBalance: (
    accountId: string,
  ) => Promise<AxiosResponse<IndicativeBalance>>;
};

export default function userService(): UserServiceProps {
  const fetchAll = async (size?: number) => {
    return await request(`/users`, {
      method: "get",
      params: size ? { size } : undefined,
    });
  };

  const fetchAccounts = async (clientId: string) => {
    return await request(`/users/${clientId}/accounts`, {
      method: "get",
    });
  };

  const fetchIndicativeBalance = async (accountId: string) => {
    return await request(`/users/accounts/${accountId}/indicative-balance`, {
      method: "get",
    });
  };

  return {
    fetchAll,
    fetchAccounts,
    fetchIndicativeBalance,
  };
}