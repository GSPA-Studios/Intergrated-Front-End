export interface User {
  id: string;
  username: string;
  position: 'manager' | 'member';
  date_created?: string;
} 