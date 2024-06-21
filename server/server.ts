import { server } from './index';
import sequelize from './db';

var PORT = parseInt(process.env.PORT || '3001');
(async () => {
  await sequelize.sync().then(() => console.log('\nConnected to the database'));
  server.listen(PORT, () => {
    console.log('node env: ', process.env.NODE_ENV)
    console.log(
      `\nServer running on ${
        process.env.NODE_ENV === 'production'
          ? `server port: ${PORT}`
          : `http://localhost:${PORT}`
      }`
    );
  });
})();
