import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm'
import CategoryGroup from './CategoryGroup'
import Product from './Product'

@Entity()
export default class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column('nvarchar', { length: 50 })
    name: string

    @Column('varchar', { length: 255 })
    img: string

    @ManyToOne(() => CategoryGroup, (cate) => cate.categories, {
        onDelete: 'SET NULL',
    })
    categoryGroup: CategoryGroup | null

    @OneToMany(() => Product, (prod) => prod.category)
    products: Product[]
}
