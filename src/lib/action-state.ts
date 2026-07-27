// Shared initial state for useActionState hooks. Kept out of any "use server"
// file — those may only export async functions, not plain values.
export const initialActionState = { error: null };
