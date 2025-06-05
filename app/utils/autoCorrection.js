export const correctEmail = input => {
  if (!input?.includes('@')) return input; // Ignore if there's no '@'

  const parts = input.split('@');
  const userPart = parts[0];
  let domainPart = parts[1] || '';

  const commonTypos = [
    'gmal.com',
    'gmai.com',
    'gmial.com',
    'gmil.com',
    'gmaik.com',
    'gmeil.com',
    'gmayl.com',
    'gmajl.com',
    'gmaol.com',
    'gmali.com',
    'gmail.con',
    'gmail.cm',
    'gmail.co',
    'gmail.coom',
    'gmall.com',
    'gmaail.com',
    'gmaill.com',
    'gamil.com',
    'gami.com',
    'gaml.com',
  ];

  if (commonTypos.includes(domainPart)) {
    domainPart = 'gmail.com';
  }

  return `${userPart}@${domainPart}`;
};
