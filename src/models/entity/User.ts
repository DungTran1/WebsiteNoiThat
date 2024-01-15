import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm'
import Cart from './Cart'
import Order from './Order'
import Product from './Product'

@Entity()
export default class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column('nvarchar', { length: 50 })
    fullName: string

    @Column('varchar', { length: 255 })
    username: string

    @Column('varchar', { length: 255 })
    password: string

    @Column('varchar', { length: 255 })
    email: string

    @Column('varchar', { length: 15 })
    phoneNumber: string

    @Column('date')
    DoB: Date

    @Column('tinyint')
    gender: number

    @Column('nvarchar', { length: 255 })
    address: string

    @Column('tinyint', { default: 2 })
    role: number

    @ManyToMany(() => Product, (product) => product.wishlist, { onDelete: 'CASCADE' })
    @JoinTable()
    wishlist: Product[]

    @OneToMany(() => Cart, (cart) => cart.user)
    cart: Cart[]

    @OneToMany(() => Order, (order) => order.user)
    order: Order[]
}
