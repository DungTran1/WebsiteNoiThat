import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany } from 'typeorm'
import Cart from './Cart'
import Category from './Category'
import OrderDetail from './OrderDetail'
import ProductImage from './ProductImage'
import User from './User'

@Entity()
export default class Product {
    @PrimaryGeneratedColumn()
    id: number

    @Column('nvarchar', { length: 255 })
    name: string

    @Column('varchar', { length: 255 })
    img: string

    @Column('nvarchar', { length: 4000 })
    description: string

    @Column('nvarchar', { length: 255 })
    size: string

    @Column('nvarchar', { length: 255 })
    color: string

    @Column('nvarchar', { length: 255 })
    material: string

    @Column('nvarchar', { length: 255 })
    origin: string

    @Column('int')
    price: number

    @Column('tinyint')
    discount: number

    @Column('int')
    amount: number

    @ManyToOne(() => Category, (cate) => cate.products, {
        onDelete: 'SET NULL',
    })
    category: Category | null

    @OneToMany(() => ProductImage, (image) => image.product)
    images: ProductImage[]

    @ManyToMany(() => User, (user) => user.wishlist, { onDelete: 'CASCADE' })
    wishlist: User[]

    @OneToMany(() => Cart, (cart) => cart.product)
    cart: Cart[]

    @OneToMany(() => OrderDetail, (order) => order.product)
    orderDetail: OrderDetail[]
}
