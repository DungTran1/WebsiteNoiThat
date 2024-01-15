export enum UserRoles {
    Admin = 0,
    Manager = 1,
    Customer = 2,
}

export enum OrderStatus {
    Unconfirmed = 1,
    Confirmed = 2,
    Completed = 3,
    Canceled = 4,
}

export const orderStatusForDisplay = [
    { value: OrderStatus.Unconfirmed, text: 'Chờ xác nhận' },
    { value: OrderStatus.Confirmed, text: 'Đã xác nhận' },
    { value: OrderStatus.Completed, text: 'Hoàn tất' },
    { value: OrderStatus.Canceled, text: 'Đơn huỷ' },
]

export const userRolesForDisplay = [
    { value: UserRoles.Admin, text: 'Admin' },
    { value: UserRoles.Manager, text: 'Quản lý' },
    { value: UserRoles.Customer, text: 'Khách hàng' },
]
export const userGendersForDisplay = [
    { value: 0, text: 'Nam' },
    { value: 1, text: 'Nữ' },
    { value: 2, text: 'Khác' },
]
