import axios from "axios";

export class ApiService {
  public async get<T, R = never>(url: string, params: T) {
    return await axios.get<R>(url, { params });
  }

  public async post<T, R = never>(url: string, params: T) {
    return await axios.post<R>(url, { params });
  }
}
