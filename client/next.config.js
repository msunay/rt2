import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
});

export default withPWA({
  redirects: [
    {
      source: '/auth',
      destination: '/',
      permanent: true,
    }
  ]
});