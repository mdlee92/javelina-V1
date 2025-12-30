export const getPatientInitials = (name: string): string => {
  const parts = name.trim().split(' ');

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  // First and last name initials
  const firstInitial = parts[0].charAt(0).toUpperCase();
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();

  return firstInitial + lastInitial;
};
