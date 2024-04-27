"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const category_controller_1 = require("../controllers/category.controller");
const categoryRouter = express_1.default.Router();
categoryRouter.post("/create-category", auth_1.authorizeUser, (0, auth_1.authorizeRoles)("admin"), category_controller_1.createCategory);
categoryRouter.get("/get-all-category", category_controller_1.getAllCategory);
categoryRouter.get("/get-category/:id", auth_1.authorizeUser, (0, auth_1.authorizeRoles)("admin"), category_controller_1.getCategory);
categoryRouter.put("/edit-category/:id", auth_1.authorizeUser, (0, auth_1.authorizeRoles)("admin"), category_controller_1.updateCategory);
categoryRouter.delete("/delete-category/:id", auth_1.authorizeUser, (0, auth_1.authorizeRoles)("admin"), category_controller_1.deleteCategory);
exports.default = categoryRouter;
//# sourceMappingURL=category.route.js.map