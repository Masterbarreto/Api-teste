import { Router } from "express";
import { userController, restaurantController, orderController, foodAreaController, termsController } from "../controllers/index.js";
import { checkToken } from "../middlewares/checkToken.js";

const router = Router();

// Registre a rota de verificação primeiro:
router.get("/api/v1/users/verify", userController.verifyQueryValidation, userController.verifyUser);

//#region users

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operações relacionadas a usuários
 */

router.get("/reset_password", userController.sendValidationCode);
router.post("/", async (req, res) => {
  res.json({ message: "oi" });
});
router.post("/reset_password", userController.resetPasswordValidation, userController.resetPassword);
router.post("/users", userController.createValidation, userController.create);
router.post("/users/login", userController.loginValidation, userController.login);
router.post("/users/logout", checkToken("user"), userController.logout);
router.get("/users/profile", checkToken("user"), userController.getProfile);
router.get("/users/orders", checkToken("user"), userController.getOrders);
router.get("/users/orders/:order_id", checkToken("user"), userController.orderByIdValidation, userController.getOrderById);
router.patch("/users", checkToken("user"), userController.updateValidation, userController.updateUser);
router.delete("/users/", checkToken("user"), userController.deleteUser);
router.get("/users/cart/", checkToken("user"), userController.getCart);
router.patch("/users/cart/", checkToken("user"), userController.updateCart);

// Certifique-se de que esta rota dinâmica venha depois da rota estática:
router.get("/users/:user_id", userController.getByIdValidation, userController.getUserById);

//#endregion

//#region area

router.post("/area/", foodAreaController.createValidation, foodAreaController.create);
router.get("/area/", foodAreaController.getAll);
router.get("/area/:area_id/restaurants", foodAreaController.getAllRestaurants);
router.get("/area/:area_id/restaurants/:restaurant_id", foodAreaController.createRestaurantValidation, foodAreaController.getRestaurant);
router.get("/area/:area_id/restaurants/:restaurant_id/items", foodAreaController.createRestaurantValidation, foodAreaController.getRestaurantItems);
router.get("/area/:area_id/restaurants/:restaurant_id/items/:item_id", foodAreaController.restaurantGetItemValidation, foodAreaController.getRestaurantItemById);

//#endregion

router.post("/cart/", checkToken("user"), orderController.cartValidation, orderController.createCart);

//#region restaurants

router.post("/restaurants", restaurantController.createValidation, restaurantController.create);
router.get("/restaurants/profile", checkToken("restaurant"), restaurantController.getProfile);
router.get("/restaurants/items", checkToken("restaurant"), restaurantController.getAllItems);
router.post("/restaurants/items", checkToken("restaurant"), restaurantController.createItemValidation, restaurantController.createItem);
router.patch("/restaurants/items/:item_id", checkToken("restaurant"), restaurantController.updateValidation, restaurantController.update);
router.delete("/restaurants/items/:item_id", checkToken("restaurant"), restaurantController.deleteValidation, restaurantController.deleteItem);
router.get("/restaurants/items/:item_id", checkToken("restaurant"), restaurantController.idValidation, restaurantController.getItem);

//#endregion

//#region orders

router.post("/orders", checkToken("user"), orderController.createOrderValidation, orderController.createOrder);
router.get("/orders/:order_id", checkToken("user"), orderController.orderByIdValidation, orderController.getOrderById);

//#endregion

//#region terms

router.get("/terms", termsController.terms);
//#endregion

export { router as apiRouter };
