export const http404 = (msg = 'Not found') => createError({ statusCode: 404, statusMessage: msg })

export const http403 = (msg = 'Forbidden') => createError({ statusCode: 403, statusMessage: msg })

export const http409 = (msg = 'Conflict') => createError({ statusCode: 409, statusMessage: msg })
