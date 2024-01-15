import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import Product from './Product'

@Entity()
export default class ProductImage {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Product, (prod) => prod.images, {
        onDelete: 'CASCADE',
    })
    product: Product | null

    @Column('varchar', { length: 255 })
    img: string
}
