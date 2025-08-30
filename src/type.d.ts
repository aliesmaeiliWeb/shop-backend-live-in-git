interface UserPayload {
  id: number;
  email: string;
  name: string;
  // password: string;
  lastName: string;
  avatar: string;
  role: string;
}

declare namespace Express {
  export interface Request {
    currentUser: UserPayload;
  }
}

declare module 'xss-clean';
declare module 'kavenegar';
