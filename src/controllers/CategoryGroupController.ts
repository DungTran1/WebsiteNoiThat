import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import AppDataSource, { CategoryGroup } from '../models'

const CategoryGroupRepository = AppDataSource.getRepository(CategoryGroup)

class CategoryGroupController {
    // [GET] /
    async GetAll(req: Request, res: Response, next: NextFunction) {
        try {
            const groupList = await CategoryGroupRepository.find()
            return res.render('admin/categoryGroup/index', { groupList })
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
                const group = CategoryGroupRepository.create({
                    name: req.body.name,
                    img: req.file?.filename || '',
                })
                const rs = await CategoryGroupRepository.save(group)
                if (rs) res.locals.createSuccess = true
            }
            res.render('admin/categoryGroup/create')
        } catch (error) {
            next(error)
        }
    }

    // [GET | POST] /edit:id
    async Edit(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req)
            res.locals.errors = errors.array()

            const group = await CategoryGroupRepository.findOneBy({ id: parseInt(req.params.id) })
            if (group) {
                if (req.method === 'POST' && errors.isEmpty()) {
                    group.name = req.body.name
                    group.img = req.file?.filename || group.img

                    const rs = await CategoryGroupRepository.save(group)
                    if (rs) res.locals.editSuccess = true
                }
                res.locals.groupInfo = group
            }
            res.render('admin/categoryGroup/edit')
        } catch (error) {
            next(error)
        }
    }

    // [GET] /details:id
    async Details(req: Request, res: Response, next: NextFunction) {
        try {
            const groupInfo = await CategoryGroupRepository.findOne({
                where: { id: parseInt(req.params.id) },
            })
            res.render('admin/categoryGroup/details', { groupInfo })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /delete:id
    async Delete(req: Request, res: Response, next: NextFunction) {
        try {
            const rs = await CategoryGroupRepository.delete(req.params.id)
            res.json({
                message: rs.affected === 0 ? 'Lỗi xoá nhóm danh mục' : 'Xoá nhóm danh mục thành công',
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new CategoryGroupController()
