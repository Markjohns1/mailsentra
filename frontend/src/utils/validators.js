export const validators = {
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  },

  password: (password) => {
    return password.length >= 8
  },

  required: (value) => {
    return value && value.trim().length > 0
  },
}

