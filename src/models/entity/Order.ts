import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm'
import OrderDetail from './OrderDetail'
import User from './User'

@Entity()
export default class Order {
    @PrimaryGeneratedColumn()
    id: number

    @Column('datetime', { default: Date.now() })
    orderDate: Date

    @Column('datetime', { nullable: true })
    deliveryDate: Date | null

    @Column('nvarchar', { length: 255 })
    deliveryAddress: string

    @Column('nvarchar', { length: 4000 })
    note: string

    @Column('int')
    totalPrice: number

    @Column('bit', { default: false })
    isPaid: boolean

    @Column('tinyint', { default: 1 })
    status: number

    @ManyToOne(() => User, (user) => user.order, { onDelete: 'SET NULL' })
    user: User

    @OneToMany(() => OrderDetail, (detail) => detail.order)
    details: OrderDetail[]
}
