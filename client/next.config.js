const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});

module.exports = withPWA({
  redirects: [
    {
      source: '/auth',
      destination: '/',
      permanent: true,
    }
  ]
});