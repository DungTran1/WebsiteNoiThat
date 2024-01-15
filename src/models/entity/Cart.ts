import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import Product from './Product'
import User from './User'

@Entity()
export default class Cart {
    @PrimaryGeneratedColumn()
    id: number

    @Column('int')
    amount: number

    @ManyToOne(() => User, (user) => user.cart, { onDelete: 'CASCADE' })
    user: User

    @ManyToOne(() => Product, (product) => product.cart, { onDelete: 'CASCADE' })
    product: Product
}
