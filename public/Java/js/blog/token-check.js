import { accessToken } from './store';

export const tokenCheck = {
    hasToken: async() => {
        let accessToken = sessionStorage.getItem("refreshToken");
        let refreshToken = sessionStorage.getItem("refreshToken");
        let id = sessionStorage.getItem("id");

        if (accessToken == "" || accessToken == null ||
            refreshToken == "" || refreshToken == null ||
            id == "" || id == null) {
            return false;
        } else {
            return true;
        }
    }
};