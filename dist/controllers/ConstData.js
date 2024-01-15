"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userGendersForDisplay = exports.userRolesForDisplay = exports.orderStatusForDisplay = exports.OrderStatus = exports.UserRoles = void 0;
var UserRoles;
(function (UserRoles) {
    UserRoles[UserRoles["Admin"] = 0] = "Admin";
    UserRoles[UserRoles["Manager"] = 1] = "Manager";
    UserRoles[UserRoles["Customer"] = 2] = "Customer";
})(UserRoles = exports.UserRoles || (exports.UserRoles = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus[OrderStatus["Unconfirmed"] = 1] = "Unconfirmed";
    OrderStatus[OrderStatus["Confirmed"] = 2] = "Confirmed";
    OrderStatus[OrderStatus["Completed"] = 3] = "Completed";
    OrderStatus[OrderStatus["Canceled"] = 4] = "Canceled";
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));
exports.orderStatusForDisplay = [
    { value: OrderStatus.Unconfirmed, text: 'Chờ xác nhận' },
    { value: OrderStatus.Confirmed, text: 'Đã xác nhận' },
    { value: OrderStatus.Completed, text: 'Hoàn tất' },
    { value: OrderStatus.Canceled, text: 'Đơn huỷ' },
];
exports.userRolesForDisplay = [
    { value: UserRoles.Admin, text: 'Admin' },
    { value: UserRoles.Manager, text: 'Quản lý' },
    { value: UserRoles.Customer, text: 'Khách hàng' },
];
exports.userGendersForDisplay = [
    { value: 0, text: 'Nam' },
    { value: 1, text: 'Nữ' },
    { value: 2, text: 'Khác' },
];
