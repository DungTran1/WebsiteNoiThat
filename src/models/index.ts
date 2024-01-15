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
    host: 'localhost',
    username: 'sa',
    password: 'khongthe01',
    database: 'WebsiteNoiThat',
    synchronize: true,
    logging: false,
    entities: [User, Category, Product, ProductImage, CategoryGroup, Cart, Order, OrderDetail],
    migrations: [],
    subscribers: [],
    options: {
        encrypt: false,
    },
})

export { User, Category, Product, ProductImage, CategoryGroup, Cart, Order, OrderDetail }
export default AppDataSource
