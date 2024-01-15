import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import AppDataSource, { Category, CategoryGroup } from '../models'

const CategoryGroupRepository = AppDataSource.getRepository(CategoryGroup)
const CategoryRepository = AppDataSource.getRepository(Category)

class CategoryController {
    // [GET] /
    async GetAll(req: Request, res: Response, next: NextFunction) {
        try {
            const cateList = await CategoryRepository.find({ relations: { categoryGroup: true } })
            return res.render('admin/category/index', { cateList })
        } catch (error) {
            next(error)
        }
    }

    // [GET | POST] /create
    async Create(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req)
            res.locals.errors = errors.array()

            if (req.method === 'POST' && errors.isEmpty()) {
                const group = await CategoryGroupRepository.findOneBy({ id: parseInt(req.body.groupId) })
                const cate = CategoryRepository.create({
                    name: req.body.name,
                    img: req.file?.filename || '',
                    categoryGroup: group,
                })
                const rs = await CategoryRepository.save(cate)
                if (rs) res.locals.createSuccess = true
            }
            const cateGroups = await CategoryGroupRepository.find()
            res.render('admin/category/create', { cateGroups })
        } catch (error) {
            next(error)
        }
    }

    // [GET | POST] /edit:id
    async Edit(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req)
            res.locals.errors = errors.array()

            const cate = await CategoryRepository.findOne({
                relations: { categoryGroup: true },
                where: { id: parseInt(req.params.id) },
            })
            if (cate) {
                if (req.method === 'POST' && errors.isEmpty()) {
                    const group = await CategoryGroupRepository.findOneBy({
                        id: parseInt(req.body.groupId),
                    })
                    cate.name = req.body.name
                    cate.img = req.file?.filename || cate.img
                    cate.categoryGroup = group

                    const rs = await CategoryRepository.save(cate)
                    if (rs) res.locals.editSuccess = true
                }
                res.locals.cateInfo = cate
            }
            const cateGroups = await CategoryGroupRepository.find()
            res.render('admin/category/edit', { cateGroups })
        } catch (error) {
            next(error)
        }
    }

    // [GET] /details:id
    async Details(req: Request, res: Response, next: NextFunction) {
        try {
            const cateInfo = await CategoryRepository.findOne({
                relations: { categoryGroup: true },
                where: { id: parseInt(req.params.id) },
            })
            res.render('admin/category/details', { cateInfo })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /delete:id
    async Delete(req: Request, res: Response, next: NextFunction) {
        try {
            const rs = await CategoryRepository.delete(req.params.id)
            res.json({ message: rs.affected === 0 ? 'Lỗi xoá danh mục' : 'Xoá danh mục thành công' })
        } catch (error) {
            next(error)
        }
    }
}

export default new CategoryController()
