export const authService = {
    getAccessToken: (): string | null => localStorage.getItem('accessToken'),
    getRefreshToken: (): string | null => localStorage.getItem('refreshToken'),
    setTokens: ({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },
    clearTokens: (): void => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };
  