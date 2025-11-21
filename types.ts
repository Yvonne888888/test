export interface User {
  name: string;
  isLoggedIn: boolean;
}

export interface Comment {
  id: string;
  eventId: string;
  userName: string;
  content: string;
  timestamp: number;
}

export interface Photo {
  id: string;
  eventId: string;
  userName: string;
  url: string; // Base64 or URL
  timestamp: number;
}

export interface RSVP {
  id: string;
  eventId: string;
  userName: string;
  contact: string;
  status: 'paid' | 'pending'; // Simplified for demo
  checkInTime?: number;
  timestamp: number;
}

export interface EventData {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  cost: number;
  description: string;
  coverImage: string;
  organizer: string;
  paymentQRCode?: string; // New field for organizer's payment code
  timestamp: number;
}

export enum ViewState {
  LOGIN = 'LOGIN',
  LIST = 'LIST',
  CREATE = 'CREATE',
  DETAIL = 'DETAIL',
}