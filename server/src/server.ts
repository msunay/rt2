import { server } from '@/index';
import sequelize from '@/db';

const PORT = parseInt(process.env.PORT || '3001');
const HOST = '0.0.0.0';

(async () => {
  await sequelize.sync();
  console.log('Connected to the database');

  server.listen(PORT, HOST, () => {
    console.log('node env:', process.env.NODE_ENV);
    console.log(
      `Server running on ${
        process.env.NODE_ENV === 'production'
          ? `port ${PORT}`
          : `http://${HOST}:${PORT}`
      }`
    );
  });
})();
