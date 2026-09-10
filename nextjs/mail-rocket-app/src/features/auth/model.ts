export type { User } from "@/types/resources";

export interface SignupRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}
