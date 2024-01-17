import 'reflect-metadata'
import { DataSource } from 'typeorm'
import User from './entity/User'
import Category from './entity/Category'
import CategoryGroup from './entity/CategoryGroup'
import Product from './entity/Product'
import ProductImage from './entity/ProductImage'
import Cart from './entity/Cart'
import Order from './entity/Order'
import OrderDetail from './entity/OrderDetail'

const AppDataSource = new DataSource({
    type: 'mssql',
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: true,
    logging: false,
    port: parseInt(process.env.DATABASE_PORT || ''),
    entities: [User, Category, Product, ProductImage, CategoryGroup, Cart, Order, OrderDetail],
    migrations: [],
    subscribers: [],
    options: {
        encrypt: true,
    },
})

export { User, Category, Product, ProductImage, CategoryGroup, Cart, Order, OrderDetail }
export default AppDataSource
