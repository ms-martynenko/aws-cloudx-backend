export interface Product {
	id: string;
	title: string;
	description: string;
	price: number;
}

export interface ProductStock {
	product_id: Product["id"];
	count: number;
}

export type InitialProductData = Omit<Product, "id"> & Omit<ProductStock, "product_id">;
export type CreatedProductData = Product & Omit<ProductStock, "product_id">;
