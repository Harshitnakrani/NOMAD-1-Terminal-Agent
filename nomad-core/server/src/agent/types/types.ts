export interface Messages {
  role: Entities;
  message?: string;
  action?: string;
  returnToBrain: boolean;
  payload: any;
}

export enum Entities {
  user = 'user',
  agent = 'agent',
  system = 'system',
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export enum tools {
  runGenratedCommand = 'runGenratedCommand',
}
