// // routes/invoiceRoutes.js
// const express = require("express");
// const router = express.Router();
// const { generateInvoiceNumber } = require("../controllers/invoiceController");


// router.post("/generateInvoiceNumber", async (req, res) => {
//   const { userId } = req.body;

//   try {
//     const invoiceNumber = await generateInvoiceNumber(userId);
//     res.json({ success: true, invoiceNumber });
//   } catch (err) {
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Error generating invoice number",
//         error: err.message,
//       });
//   }
// });

// module.exports = router;
