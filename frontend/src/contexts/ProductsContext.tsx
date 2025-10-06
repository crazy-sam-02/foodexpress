import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  tags: string[];
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

interface ProductsContextType {
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, "_id" | "rating" | "reviews">) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleProductStock: (productId: string) => Promise<void>;

  addCategory: (category: Omit<Category, "_id" | "productCount">) => Promise<void>;
  updateCategory: (categoryId: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch products
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // Fetch categories
  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // ---------------- PRODUCT CRUD ----------------
  const addProduct = async (productData: Omit<Product, "_id" | "rating" | "reviews">) => {
    const res = await fetch("http://localhost:5000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    const newProduct = await res.json();
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const updated = await res.json();
    setProducts((prev) => prev.map((p) => (p._id === productId ? updated : p)));
  };

  const deleteProduct = async (productId: string) => {
    await fetch(`http://localhost:5000/api/products/${productId}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  const toggleProductStock = async (productId: string) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;
    await updateProduct(productId, { inStock: !product.inStock });
  };

  // ---------------- CATEGORY CRUD ----------------
  const addCategory = async (categoryData: Omit<Category, "_id" | "productCount">) => {
    const res = await fetch("http://localhost:5000/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryData),
    });
    const newCategory = await res.json();
    setCategories((prev) => [...prev, { ...newCategory, productCount: 0 }]);
  };

  const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
    const res = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const updated = await res.json();
    setCategories((prev) => prev.map((c) => (c._id === categoryId ? { ...c, ...updated } : c)));
  };

  const deleteCategory = async (categoryId: string) => {
    await fetch(`http://localhost:5000/api/categories/${categoryId}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c._id !== categoryId));
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStock,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) throw new Error("useProducts must be used within a ProductsProvider");
  return context;
};
