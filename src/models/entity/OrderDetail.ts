import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import Order from './Order'
import Product from './Product'

@Entity()
export default class OrderDetail {
    @PrimaryGeneratedColumn()
    id: number

    @Column('int')
    amount: number

    @Column('int')
    price: number

    @ManyToOne(() => Order, (order) => order.details, { onDelete: 'CASCADE' })
    order: Order

    @ManyToOne(() => Product, (product) => product.orderDetail, { onDelete: 'SET NULL' })
    product: Product
}
