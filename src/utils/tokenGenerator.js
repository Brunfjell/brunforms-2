const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateToken({ prefix = 'BRUN', length = 6 } = {}) {
let token = '';
for (let i = 0; i < length; i++) {
token += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
}
return `${prefix}-${token}`;
}


export default generateToken;