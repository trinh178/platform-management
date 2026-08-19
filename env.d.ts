declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_URL: string;
      APIGATEWAY_BASE_URL: string;
      NEXT_PUBLIC_APIGATEWAY_IAM: string;
      NEXT_PUBLIC_APIGATEWAY_HRM_EM: string;
      NEXT_PUBLIC_APIGATEWAY_FTM: string;
      NEXT_PUBLIC_APIGATEWAY_PLM: string;
      NEXT_PUBLIC_APIPROXY_BASE_URL: string;
      // Bypass gateway, trỏ thẳng vào service (chỉ server-side, dùng cho dev)
      IAM_DIRECT_URL?: string;
      HRMEM_DIRECT_URL?: string;
      FTM_DIRECT_URL?: string;
      PLM_DIRECT_URL?: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      NEXTAUTH_COOKIE_DOMAIN: string;
      NEXT_PUBLIC_SIGNIN_URL: string;
      NEXT_PUBLIC_WEB_SHARED_REMOTE_BASE_URL: string;
      NEXT_PUBLIC_APP_KEY: string;
      NEXT_PUBLIC_SINGLE_APP: string;
      NEXT_PUBLIC_MOCK_API: string;
    }
  }
}

export {};
