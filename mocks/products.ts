import { Product, ProductStock } from "../types/Product";
import { v4 as uuidv4 } from "uuid";

export const products: Product[] = [
	{
		id: uuidv4(),
		description:
			"High-performance wireless noise-cancelling headphones with 30-hour battery life and premium sound quality",
		price: 299.99,
		title: "Sony WH-1000XM5 Wireless Headphones",
	},
	{
		id: uuidv4(),
		description:
			"Ultra-lightweight gaming laptop with RTX 4070, 16GB RAM, and 144Hz display for professional gaming",
		price: 1899.0,
		title: "ASUS ROG Zephyrus G14 Gaming Laptop",
	},
	{
		id: uuidv4(),
		description: "Premium organic cotton blend hoodie with sustainable materials and modern fit",
		price: 89.95,
		title: "Patagonia Organic Cotton Hoodie",
	},
	{
		id: uuidv4(),
		description: "Smart fitness tracker with heart rate monitoring, GPS, and 7-day battery life",
		price: 249.99,
		title: "Fitbit Charge 6 Fitness Tracker",
	},
	{
		id: uuidv4(),
		description:
			"Professional-grade stainless steel chef's knife with ergonomic handle and lifetime sharpening",
		price: 179.0,
		title: "Wüsthof Classic 8-inch Chef's Knife",
	},
	{
		id: uuidv4(),
		description:
			"Compact Bluetooth speaker with 360-degree sound, waterproof design, and 12-hour playtime",
		price: 149.99,
		title: "Ultimate Ears BOOM 3 Portable Speaker",
	},
	{
		id: uuidv4(),
		description:
			"Artisan dark roast coffee beans sourced from single-origin Colombian farms, 12oz bag",
		price: 18.5,
		title: "Blue Bottle Coffee Colombian Dark Roast",
	},
	{
		id: uuidv4(),
		description:
			"Smart home security camera with 4K video, night vision, and AI-powered motion detection",
		price: 399.99,
		title: "Nest Cam IQ Outdoor Security Camera",
	},
];

export const productsStocks: ProductStock[] = products.map(({ id }) => ({
	product_id: id,
	count: Math.floor(Math.random() * 100),
}));
