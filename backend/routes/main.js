const express = require("express");
const router = express.Router();
const authRouter = require("./auth.js")
const userRouter = require("./user.js")
const adminRouter = require("./admin.js")

router.use("/auth" , authRouter)
router.use("/user" , userRouter)
router.use("/admin" , adminRouter)

module.exports = router;