import { Contact } from '../interfaces/contacts-interfaces';

const COLORS = [
  '#FF5EB3', '#6E52FF', '#FF7A00', '#9327FF', '#1FD7C1', '#FF4646',
  '#C3FF2B', '#00BEE8', '#FFA35E', '#FFBB2B', '#FFC701', '#FFE62B',
  '#0038FF', '#FC71FF', '#FF3D8A', '#7A3CFF', '#FF5A3D', '#0FB39E',
  '#E83E3E', '#A8F01A', '#00A4FF', '#FF8AD6', '#6AF7FF', '#FFCE5A',
  '#2D77FF', '#F04AFF', '#00E26D', '#845EFF',
];

export function getContactColor(contact: Contact): string {
  return COLORS[(contact.firstName.charCodeAt(0) + contact.lastName.charCodeAt(0)) % COLORS.length];
}

export function getInitials(contact: Contact): string {
  return (contact.firstName[0] + contact.lastName[0]).toUpperCase();
}

export function getInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function findContactByName(name: string, contacts: Contact[]): Contact | null {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return null;
  return contacts.find(c => c.firstName === parts[0] && c.lastName === parts.slice(1).join(' ')) || null;
}

