import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm'
import Category from './Category'

@Entity()
export default class CategoryGroup {
    @PrimaryGeneratedColumn()
    id: number

    @Column('nvarchar', { length: 50 })
    name: string

    @Column('varchar', { length: 255 })
    img: string

    @OneToMany(() => Category, (cate) => cate.categoryGroup)
    categories: Category[]
}
