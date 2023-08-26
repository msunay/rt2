import { server } from './index';
import sequelize from './db';

const PORT = 3001;
(async () => {
  await sequelize.sync().then(() => console.log('Connected to the database'));
  server.listen(PORT);
  console.log(
    `Server running on ${
      process.env.NODE_ENV === 'production'
        ? `https://patient-star-685.fly.dev:${PORT}`
        : `http://localhost:${PORT}`
    }`
  );
})();
