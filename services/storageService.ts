import { EventData, RSVP, Comment, Photo } from '../types';

const KEYS = {
  EVENTS: 'class_gather_events',
  RSVPS: 'class_gather_rsvps',
  COMMENTS: 'class_gather_comments',
  PHOTOS: 'class_gather_photos',
  USER: 'class_gather_user'
};

// Helper to load/save
const load = <T,>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const save = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Storage quota exceeded or error saving", e);
    alert("存储空间不足，无法保存数据（可能是因为照片太多或太大）。");
  }
};

// --- Events ---
export const getEvents = (): EventData[] => load<EventData[]>(KEYS.EVENTS, []);
export const saveEvent = (event: EventData) => {
  const events = getEvents();
  save(KEYS.EVENTS, [event, ...events]); // Newest first
};
export const updateEvent = (updatedEvent: EventData) => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === updatedEvent.id);
  if (index !== -1) {
    events[index] = updatedEvent;
    save(KEYS.EVENTS, events);
  }
};
export const getEventById = (id: string): EventData | undefined => {
  return getEvents().find(e => e.id === id);
};

// --- RSVPs ---
export const getRSVPs = (eventId: string): RSVP[] => {
  const all = load<RSVP[]>(KEYS.RSVPS, []);
  return all.filter(r => r.eventId === eventId);
};
export const addRSVP = (rsvp: RSVP) => {
  const all = load<RSVP[]>(KEYS.RSVPS, []);
  save(KEYS.RSVPS, [...all, rsvp]);
};
export const removeRSVP = (eventId: string, userName: string) => {
  const all = load<RSVP[]>(KEYS.RSVPS, []);
  const filtered = all.filter(r => !(r.eventId === eventId && r.userName === userName));
  save(KEYS.RSVPS, filtered);
};
export const checkInUser = (eventId: string, userName: string) => {
  const all = load<RSVP[]>(KEYS.RSVPS, []);
  const updated = all.map(r => {
    if (r.eventId === eventId && r.userName === userName && !r.checkInTime) {
      return { ...r, checkInTime: Date.now() };
    }
    return r;
  });
  save(KEYS.RSVPS, updated);
};

// --- Comments ---
export const getComments = (eventId: string): Comment[] => {
  const all = load<Comment[]>(KEYS.COMMENTS, []);
  return all.filter(c => c.eventId === eventId).sort((a, b) => b.timestamp - a.timestamp);
};
export const addComment = (comment: Comment) => {
  const all = load<Comment[]>(KEYS.COMMENTS, []);
  save(KEYS.COMMENTS, [comment, ...all]);
};

// --- Photos ---
export const getPhotos = (eventId: string): Photo[] => {
  const all = load<Photo[]>(KEYS.PHOTOS, []);
  return all.filter(p => p.eventId === eventId).sort((a, b) => b.timestamp - a.timestamp);
};
export const addPhoto = (photo: Photo) => {
  const all = load<Photo[]>(KEYS.PHOTOS, []);
  save(KEYS.PHOTOS, [photo, ...all]);
};

// --- Auth Mock ---
export const getStoredUser = () => localStorage.getItem(KEYS.USER);
export const setStoredUser = (name: string) => localStorage.setItem(KEYS.USER, name);
export const logoutStoredUser = () => localStorage.removeItem(KEYS.USER);