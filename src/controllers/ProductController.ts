import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import AppDataSource, { Product, Category, ProductImage } from '../models'

const CategoryRepository = AppDataSource.getRepository(Category)
const ProductRepository = AppDataSource.getRepository(Product)
const ProductImageRepository = AppDataSource.getRepository(ProductImage)

class ProductController {
    // [GET] /
    async GetAll(req: Request, res: Response, next: NextFunction) {
        try {
            const productList = await ProductRepository.find({ relations: { category: true } })
            return res.render('admin/product/index', { productList })
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
                const category = await CategoryRepository.findOneBy({ id: parseInt(req.body.categoryId) })
                const product = new Product()
                ProductRepository.merge(product, req.body, {
                    img: req.file?.filename || '',
                    category: category || undefined,
                })
                const rs = await ProductRepository.save(product)
                if (rs) res.locals.createSuccess = true
            }
            const cateList = await CategoryRepository.find()
            return res.render('admin/product/create', { cateList })
        } catch (error) {
            next(error)
        }
    }

    // [GET | POST] /edit:id
    async Edit(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req)
            res.locals.errors = errors.array()

            const product = await ProductRepository.findOne({
                relations: { category: true },
                where: { id: parseInt(req.params.id) },
            })
            if (product) {
                if (req.method === 'POST' && errors.isEmpty()) {
                    const category = await CategoryRepository.findOneBy({ id: req.body.categoryId })
                    ProductRepository.merge(product, req.body, {
                        img: req.file?.filename || product.img,
                    })
                    product.category = category
                    const rs = await AppDataSource.getRepository(Product).save(product)
                    if (rs) res.locals.editSuccess = true
                }
                res.locals.productInfo = product
            }
            const cateList = await CategoryRepository.find()
            return res.render('admin/product/edit', { cateList })
        } catch (error) {
            next(error)
        }
    }

    async GetImgList(req: Request, res: Response, next: NextFunction) {
        const product = await ProductRepository.findOne({
            relations: { images: true },
            where: { id: parseInt(req.params.id) },
        })
        res.json(product?.images || [])
    }

    async AddImg(req: Request, res: Response, next: NextFunction) {
        try {
            const product = await ProductRepository.findOneBy({ id: parseInt(req.params.id) })
            if (req.files instanceof Array) {
                const images = req.files.map(function (file) {
                    return { product: product, img: file.filename }
                })
                const productImages = ProductImageRepository.create(images)
                await ProductImageRepository.save(productImages)
            }
            res.json({ err: false })
        } catch (error) {
            res.json({ err: true })
        }
    }

    async DeleteImg(req: Request, res: Response, next: NextFunction) {
        try {
            const rs = await ProductImageRepository.delete(req.params.idImg)
            res.json({ err: rs.affected === 0 })
        } catch (error) {
            res.json({ err: true })
        }
    }

    // [GET] /details:id
    async Details(req: Request, res: Response, next: NextFunction) {
        try {
            const productInfo = await ProductRepository.findOne({
                relations: { category: true },
                where: { id: parseInt(req.params.id) },
            })
            return res.render('admin/product/details', { productInfo })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /delete:id
    async Delete(req: Request, res: Response, next: NextFunction) {
        try {
            const rs = await ProductRepository.delete(req.params.id)
            res.json({ message: rs.affected === 0 ? 'Lỗi xoá sản phẩm' : 'Xoá sản phẩm thành công' })
        } catch (error) {
            next(error)
        }
    }
}

export default new ProductController()
