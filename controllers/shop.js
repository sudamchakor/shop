const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv").config("../env");
const stripe = require("stripe")(process.env.STRIPE_SK);
// const PDFDocument = require('pdfkit');
const PDFDocument = require("pdfkit-table");

const ITEMS_PER_PAGE = 2;

const Product = require("../models/product");
const Orders = require("../models/order");

exports.getProducts = (req, res, next) => {
	const page = req.query.page || 1;
	let totalItems = 0;
	Product.find()
		.countDocuments()
		.then((numProducts) => {
			totalItems = numProducts;
			return Product.find()
				.skip((+page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE);
		})
		.then((products) => {
			console.log(products);
			res.render("./shop/product-list", {
				prods: products,
				docTitle: "Shop",
				path: "/products",
				totalProducts: totalItems,
				currentPage: +page,
				hasNextPage: ITEMS_PER_PAGE * +page < totalItems,
				hasPreviousPage: +page > 1,
				nextPage: +page + 1,
				previousPage: +page - 1,
				lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getIndex = (req, res, next) => {
	const page = req.query.page || 1;
	let totalItems = 0;
	Product.find()
		.countDocuments()
		.then((numProducts) => {
			totalItems = numProducts;
			return Product.find()
				.skip((+page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE);
		})
		.then((products) => {
			console.log(products);
			res.render("./shop/index", {
				prods: products,
				docTitle: "Shop",
				path: "/",
				totalProducts: totalItems,
				currentPage: +page,
				hasNextPage: ITEMS_PER_PAGE * +page < totalItems,
				hasPreviousPage: +page > 1,
				nextPage: +page + 1,
				previousPage: +page - 1,
				lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getProductsDetials = (req, res, next) => {
	const productId = req.params.productId;
	Product.findById(productId)
		.then((product) => {
			res.render("./shop/product-detials", {
				product: product,
				docTitle: product.title,
				path: "/product/" + product._id,
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getCart = (req, res, next) => {
	req.user
		.populate("cart.items.productId")
		.then((user) => {
			const products = user.cart.items;
			res.render("./shop/cart", {
				products: products,
				docTitle: "Your Cart",
				path: "/cart",
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postCart = (req, res, next) => {
	const productId = req.body.productId;
	Product.findById(productId)
		.then((product) => {
			return req.user.addToCart(product);
		})
		.then((result) => {
			console.log(result);
			res.redirect("/cart");
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postCartDeleteItem = (req, res, next) => {
	const productId = req.body.productId;
	req.user
		.deleteCartItem(productId)
		.then((result) => {
			res.redirect("/cart");
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.updateCartItemQty = (req, res, next) => {
	const productId = req.body.productId;
	const incrQty = req.body.incrQty;
	req.user
		.updateCartQuantity(productId, incrQty)
		.then((result) => {
			console.log(result);
			res.redirect("/cart");
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.createOrder = (req, res, next) => {
	req.user
		.populate("cart.items.productId")
		.then((user) => {
			const products = user.cart.items.map((i) => {
				return {
					quantity: i.quantity,
					product: { ...i.productId._doc },
				};
			});

			const order = new Orders({
				user: {
					email: req.user.email,
					userId: req.user,
				},
				products: products,
			});
			return order.save();
		})
		.then((result) => {
			return req.user.clearCart();
		})
		.then((result) => {
			res.redirect("/orders");
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getOrders = (req, res, next) => {
	Orders.find({ "user.userId": req.user._id })
		.then((orders) => {
			console.log(orders);
			res.render("./shop/orders", {
				orders: orders,
				docTitle: "Your Orders",
				path: "/orders",
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getInvoice = (req, res, next) => {
	const orderId = req.params.orderId;
	Orders.findById(orderId)
		.then((order) => {
			if (!order) {
				return next(new Error("No order found."));
			}
			if (order.user.userId.toString() !== req.user._id.toString()) {
				return next(new Error("Unauthorized"));
			}
			const invoiceName = "invoice-" + orderId + ".pdf";
			const invoicePath = path.join("data", "invoices", invoiceName);
			const pdfDoc = new PDFDocument({ margin: 30, size: "A4" });

			res.setHeader("Content-Type", "application/pdf");
			res.setHeader(
				"Content-Disposition",
				'inline; filename="' + invoiceName + '"'
			);
			pdfDoc.pipe(fs.createWriteStream(invoicePath));
			pdfDoc.pipe(res);

			let totalPrice = 0;
			const table = {
				title: "",
				headers: [
					{ label: "Product Name" },
					{ label: "Quantity" },
					{ label: "Price" },
					{ label: "Total Amount" },
				],
				rows: [],
			};
			order.products.forEach((prod) => {
				totalPrice = totalPrice + +prod.quantity * +prod.product.price;

				table.rows.push([
					prod.product.title,
					prod.quantity,
					`$${prod.product.price}`,
					`$ ${+prod.quantity * +prod.product.price}`,
				]);
			});

			pdfDoc
				.font("Helvetica")
				.fontSize(26)
				.text("INVOICE", { align: "center" });
			pdfDoc.moveDown();

			pdfDoc.table(table, {
				prepareHeader: () => {
					pdfDoc.font("Helvetica-Bold").fontSize(14);
				},
				width: 585,
				prepareRow: (row, indexColumn, indexRow, rectRow) => {
					pdfDoc.font("Helvetica").fontSize(12);
				},
			});
			pdfDoc.moveDown();
			pdfDoc.moveDown();
			pdfDoc
				.font("Helvetica-Bold")
				.fontSize(18)
				.text(`Total: $${totalPrice}`, { align: "right" });

			pdfDoc.end();
		})
		.catch((err) => next(err));
};

exports.getCheckout = (req, res, next) => {
	let products;
	let total = 0;
	req.user
		.populate("cart.items.productId")
		.then((user) => {
			products = user.cart.items;
			products.forEach((p) => {
				total += p.quantity * p.productId.price;
			});
			const transformedItems = products.map((item) => {
				return {
					quantity: item.quantity,
					price_data: {
						currency: "inr",
						unit_amount: +item.productId.price * 100,
						product_data: {
							name: item.productId.title,
							description: item.productId.description, //description here
							images: [item.productId.image],
						},
					},
				};
			});

			return stripe.checkout.sessions.create({
				payment_method_types: ["card"],
				line_items: transformedItems,
				mode: "payment",
				success_url:
					req.protocol +
					"://" +
					req.get("host") +
					"/checkout/success",
				cancel_url:
					req.protocol + "://" + req.get("host") + "/checkout/cancel",
			});
		})
		.then((session) => {
			res.render("./shop/checkout", {
				products: products,
				docTitle: "Checkout",
				path: "/checkout",
				totalSum: total,
				sessionId: session.id,
				STRIPE_PK: process.env.STRIPE_PK,
			});
		})
		.catch((err) => {
			console.log(err);
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getCheckoutSuccess = (req, res, next) => {
	req.user
		.populate("cart.items.productId")
		.then((user) => {
			const products = user.cart.items.map((i) => {
				return {
					quantity: i.quantity,
					product: { ...i.productId._doc },
				};
			});

			const order = new Orders({
				user: {
					email: req.user.email,
					userId: req.user,
				},
				products: products,
			});
			return order.save();
		})
		.then((result) => {
			return req.user.clearCart();
		})
		.then((result) => {
			res.redirect("/orders");
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
