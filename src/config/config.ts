export const config = () => ({
    port: process.env.PORT ? parseInt(process.env.PORT , 10) : 8080,
    // api: {
    //   apiUrl: process.env.API_URL,
    //   httpTimeout: 1000,
    // },
    mysql: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '0396721677xx',
        database: process.env.DB_NAME || 'nestjs',
    }
   });