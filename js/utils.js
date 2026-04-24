export const uuid = () => crypto.randomUUID();
export const today = () => new Date().toISOString().split('T')[0];
