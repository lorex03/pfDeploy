require('dotenv').config();console
const server = require('./src/app');
const connectDb = require('./src/db')
const {PORT} = process.env;
//agregue las comillas de la api key del punto env backend"

const startServer = async () => {
    try {
      await connectDb();
      console.log('Conexión exitosa a MongoDB Atlas');
    } catch (error) {
      console.error('Error al conectar a MongoDB Atlas:', error);
    }
  
    server.listen(PORT, () => {
      console.log(`Listening at ${PORT}`);
    });
  };
  
  startServer();