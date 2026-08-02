export const getDefaultAvatar = (id) => {
  if (!id) return '/profile1.png';
  const defaultAvatars = [
    '/profile1.png',
    '/profile2.png',
    '/profile3.png',
    '/profile4.png'
  ];
  const strId = String(id);
  const index = strId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % defaultAvatars.length;
  return defaultAvatars[index];
};
