import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Order } from './entities/order.entity';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'rncp_user',
    password: process.env.DB_PASSWORD || 'rncp_password',
    database: process.env.DB_NAME || 'rncp_db',
    entities: [User, RefreshToken, Order],
    migrations: [__dirname + '/migrations/*.js'],
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production',
});

export default AppDataSource;
