import { server } from './index';
import sequelize from './db';

var PORT = parseInt(process.env.PORT || '3001');
(async () => {
  await sequelize.sync().then(() => console.log('Connected to the database'));
  server.listen(PORT, () => {
    console.log(
      `Server running on ${
        process.env.NODE_ENV === 'production'
          ? `server port: ${PORT}`
          : `http://localhost:${PORT}`
      }`
    );
  });
})();
