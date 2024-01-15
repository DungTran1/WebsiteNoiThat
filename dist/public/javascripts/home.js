const app = {
    RenderWishlist() {
        const layoutEle = document.querySelector('#js-layout-wishlist')
        if (layoutEle) {
            fetch('/api/user-info')
                .then((rs) => rs.json())
                .then((data) => {
                    if (data) layoutEle.innerHTML = data.wishlist.length
                })
                .catch((rs) => console.log(rs))
        }

        const tableEle = document.querySelector('#js-table-wishlist')
        if (tableEle) {
            fetch('/api/user-info')
                .then((rs) => rs.json())
                .then((data) => {
                    if (data) {
                        let html = data.wishlist
                            .map(
                                (item) => `
                                    <tr>
                                        <td class="product-col">
                                            <div class="product">
                                                <figure class="product-media">
                                                    <a href="/product/${item.id}">
                                                        <img src="/images/upload/${item.img}" alt="Product image">
                                                    </a>
                                                </figure>
                                                <h3 class="product-title">
                                                    <a href="/product/${item.id}">${item.name}</a>
                                                </h3><!-- End .product-title -->
                                            </div><!-- End .product -->
                                        </td>
                                        <td class="price-col">${new Intl.NumberFormat('vi-vn', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }).format(item.price - (item.price * item.discount) / 100)}</td>
                                        ${
                                            item.amount > 0
                                                ? `
                                                <td class="stock-col"><span class="in-stock">Còn hàng</span></td>
                                                <td class="action-col">
                                                    <button class="btn btn-block btn-outline-primary-2" onclick="app.AddToCart(${item.id},1)"><i class="icon-cart-plus"></i>Thêm vào giỏ hàng</button>
                                                </td>
                                            `
                                                : `
                                                <td class="stock-col"><span class="out-of-stock">Hết hàng</span></td>
                                                <td class="action-col">
                                                    <button class="btn btn-block btn-outline-primary-2 disabled">Hết hàng</button>
                                                </td>
                                            `
                                        }
                                        <td class="remove-col" onclick="app.RemoveFromWishlist(${item.id})"><button class="btn-remove"><i class="icon-close"></i></button></td>
                                    </tr>
                                `
                            )
                            .join('')
                        tableEle.innerHTML = html
                    } else {
                        console.log('Lỗi load wishlist')
                    }
                })
                .catch((rs) => console.log(rs))
        }
    },
    AddToWishlist(productId) {
        fetch('/api/add-wishlist', {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ productId }),
        })
            .then((rs) => rs.json())
            .then((data) => {
                alert(data)
                app.RenderWishlist()
            })
            .catch((rs) => console.log(rs))
    },
    RemoveFromWishlist(productId) {
        fetch('/api/remove-wishlist', {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ productId }),
        })
            .then((rs) => rs.json())
            .then((data) => {
                if (data.err) console.log(data)
                app.RenderWishlist()
            })
            .catch((rs) => console.log(rs))
    },
    RenderCart() {
        const layoutEle = document.querySelector('#js-layout-cart')
        if (layoutEle) {
            fetch('/api/user-info')
                .then((rs) => rs.json())
                .then((data) => {
                    if (data) {
                        let html = `<a href="#" class="dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-display="static">
                            <i class="icon-shopping-cart"></i>
                            <span class="cart-count">${data.cart.length}</span>
                            <span class="cart-txt">Giỏ Hàng</span>
                        </a>
                        <div class="dropdown-menu dropdown-menu-right">
                            <div class="dropdown-cart-products">
                        ${data.cart
                            .map(
                                (item) => `
                                <div class="product">
                                    <div class="product-cart-details">
                                        <h4 class="product-title">
                                            <a href="/product/${item.product.id}">${item.product.name}</a>
                                        </h4>
                                        <span class="cart-product-info">
                                            <span class="cart-product-qty">${item.amount}</span>
                                            x ${new Intl.NumberFormat('vi-vn', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(item.product.price - (item.product.price * item.product.discount) / 100)}
                                        </span>
                                        ${item.amount <= item.product.amount ? '' : '<span class="text-danger">Hết hàng</span>'}
                                    </div><!-- End .product-cart-details -->
                                    <figure class="product-image-container">
                                        <a href="/product/${item.product.id}" class="product-image">
                                            <img src="/images/upload/${item.product.img}" alt="product">
                                        </a>
                                    </figure>
                                </div><!-- End .product -->`
                            )
                            .join('')}
                            </div><!-- End .cart-product -->
                            <div class="dropdown-cart-total">
                                <span>Tổng</span>
                                <span class="cart-total-price">${new Intl.NumberFormat('vi-vn', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(
                                    data.cart
                                        .filter((item) => item.amount <= item.product.amount)
                                        .reduce((total, item) => total + item.amount * (item.product.price - (item.product.price * item.product.discount) / 100), 0)
                                )}</span>
                            </div><!-- End .dropdown-cart-total -->
                            <div class="dropdown-cart-action justify-content-end">
                                <a href="/profile/cart" class="btn btn-primary">Xem Giỏ Hàng</a>
                            </div><!-- End .dropdown-cart-action -->
                        </div><!--End.dropdown - menu-- >`
                        layoutEle.innerHTML = html
                    } else {
                        console.log('Lỗi load cart layout')
                    }
                })
                .catch((rs) => console.log(rs))
        }

        const tableEle = document.querySelector('#js-table-cart')
        if (tableEle) {
            fetch('/api/user-info')
                .then((rs) => rs.json())
                .then((data) => {
                    if (data) {
                        let totalPrice = 0
                        let html = `
                        <div class="col-lg-9">
                            ${
                                data.cart.length === 0
                                    ? 'Bạn chưa có sản phẩm nào trong giỏ hàng'
                                    : `<table class="table table-cart table-mobile">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>Giá</th>
                                        <th>Số lượng</th>
                                        <th>Tổng</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                ${data.cart
                                    .map((item) => {
                                        const price = item.product.price - (item.product.price * item.product.discount) / 100
                                        const total = price * item.amount
                                        if (item.amount <= item.product.amount) totalPrice += total
                                        return `
                                    <tr>
                                        <td class="product-col">
                                            <div class="product">
                                                <figure class="product-media">
                                                    <a href="/product/${item.product.id}">
                                                        <img src="/images/upload/${item.product.img}" alt="Product image">
                                                    </a>
                                                </figure>
                                                <h3 class="product-title">
                                                    <a href="/product/${item.product.id}">${item.product.name}</a>
                                                    ${item.product.amount > 0 ? '' : '<span class="text-danger">Hết hàng</span>'}
                                                </h3><!-- End .product-title -->
                                            </div><!-- End .product -->
                                        </td>
                                        <td class="price-col">${new Intl.NumberFormat('vi-vn', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }).format(price)}</td>
                                        <td class="quantity-col">
                                            <div class="cart-product-quantity" data-productid="${item.product.id}">
                                                <input type="number" class="form-control" value="${item.amount}" min="1" max="1000" step="1" data-decimals="0" required>
                                            </div><!-- End .cart-product-quantity -->
                                        </td>
                                        <td class="total-col">${new Intl.NumberFormat('vi-vn', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }).format(total)}</td>
                                        <td class="remove-col" onclick="app.RemoveFromCart(${item.product.id})"><button class="btn-remove"><i class="icon-close"></i></button></td>
                                    </tr>
                                `
                                    })
                                    .join('')}
                                </tbody>
                            </table><!-- End .table table-wishlist -->`
                            }
                            <div class="cart-bottom">
                                <button onclick="app.RenderCart()" class="btn btn-outline-dark-2"><span>Cập Nhật Giỏ Hàng</span><i class="icon-refresh"></i></button>
                            </div><!-- End .cart-bottom -->
                        </div><!-- End .col-lg-9 -->
                        <aside class="col-lg-3">
                            <div class="summary summary-cart">
                                <h3 class="summary-title">Thành Tiền</h3><!-- End .summary-title -->
                                <table class="table table-summary">
                                    <tbody>
                                        <tr class="summary-total">
                                            <td>Tổng:</td>
                                            <td>${new Intl.NumberFormat('vi-vn', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(totalPrice)}</td>
                                        </tr><!-- End .summary-total -->
                                    </tbody>
                                </table><!-- End .table table-summary -->
                                <a href="/profile/checkout" class="btn btn-outline-primary-2 btn-order btn-block">Đặt Hàng</a>
                            </div><!-- End .summary -->
                            <a href="/product-list" class="btn btn-outline-dark-2 btn-block mb-3"><span>Tiếp Tục Mua Sắm</span><i class="icon-refresh"></i></a>
                        </aside><!-- End .col-lg-3 -->
                        `
                        tableEle.innerHTML = html
                        quantityInputs()
                    } else {
                        console.log('Lỗi load cart table')
                    }
                })
                .catch((rs) => console.log(rs))
            function quantityInputs() {
                if ($.fn.inputSpinner) {
                    $("table input[type='number']").inputSpinner({
                        decrementButton: '<i class="icon-minus"></i>',
                        incrementButton: '<i class="icon-plus"></i>',
                        groupClass: 'input-spinner',
                        buttonsClass: 'btn-spinner',
                        buttonsWidth: '26px',
                    })
                    document.querySelectorAll('.input-spinner').forEach((item) => {
                        const productId = item.parentNode.dataset.productid
                        if (productId) {
                            let timeout = null
                            item.querySelector('input').addEventListener('keyup', (event) => {
                                clearTimeout(timeout)
                                timeout = setTimeout(() => {
                                    const amount = event.target.value
                                    app.AddToCart(productId, amount)
                                }, 800)
                            })
                            item.querySelector('.btn-decrement').addEventListener('click', () => {
                                const amount = item.querySelector('input').value
                                app.AddToCart(productId, amount)
                            })
                            item.querySelector('.btn-increment').addEventListener('click', () => {
                                const amount = item.querySelector('input').value
                                app.AddToCart(productId, amount)
                            })
                        }
                    })
                }
            }
        }
    },
    AddToCart(productId, amount) {
        fetch('/api/add-cart', {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ productId, amount }),
        })
            .then((rs) => rs.json())
            .then((data) => {
                alert(data)
                app.RenderCart()
            })
            .catch((rs) => console.log(rs))
    },
    RemoveFromCart(productId) {
        fetch('/api/remove-cart', {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ productId }),
        })
            .then((rs) => rs.json())
            .then((data) => {
                if (data.err) console.log(data)
                app.RenderCart()
            })
            .catch((rs) => console.log(rs))
    },
}

$(document).ready(function () {
    'use strict'

    app.RenderWishlist()
    app.RenderCart()

    $('.js-addToWishlist').click(function (e) {
        const productId = e.currentTarget.dataset.id
        if (productId) app.AddToWishlist(productId)
    })

    $('.js-addToCart').click(function (e) {
        const productId = e.currentTarget.dataset.id
        if (productId) app.AddToCart(productId, 1)
    })
})
