export const STORE_TOKENS = 'STORE_TOKENS';
export const storeTokens = (accessToken, refreshToken) => ({
    type: STORE_TOKENS,
    accessToken,
    refreshToken,
});

export const STORE_PROFILE = 'STORE_PROFILE';
export const storeProfile = (profile) => ({
    type: STORE_PROFILE,
    profile,
});

export const authenticateUser = (accessToken, refreshToken) => (dispatch) => {
    dispatch(storeTokens(accessToken, refreshToken));
    const url = 'http://localhost:5000/api/fetch_user';
    const options = {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        body: {
            access_token: accessToken
        }
    };
    return fetch(url, options)
        .then(response => response.json())
        .then(profile => dispatch(storeProfile(profile)));
};


