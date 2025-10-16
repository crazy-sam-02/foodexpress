import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

// Import types from centralized location
import { Product, Category } from '@/types';
import { config } from '@/lib/config';

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
  isLoading: boolean;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

// Remove this line as we'll use config.API_URL directly

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const socketInstance = io(config.SOCKET_URL, {
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
    });

    // Real-time product updates
    socketInstance.on("product:created", (newProduct: Product) => {
      setProducts((prev) => [...prev, newProduct]);
    });

    socketInstance.on("product:updated", (updatedProduct: Product) => {
      setProducts((prev) =>
        prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
      );
    });

    socketInstance.on("product:deleted", (productId: string) => {
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    });

    // Real-time category updates
    socketInstance.on("category:created", (newCategory: Category) => {
      setCategories((prev) => [...prev, newCategory]);
    });

    socketInstance.on("category:updated", (updatedCategory: Category) => {
      setCategories((prev) =>
        prev.map((c) => (c._id === updatedCategory._id ? updatedCategory : c))
      );
    });

    socketInstance.on("category:deleted", (categoryId: string) => {
      setCategories((prev) => prev.filter((c) => c._id !== categoryId));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${config.API_URL}/products`);
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${config.API_URL}/categories`);
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // ---------------- PRODUCT CRUD ----------------
  const addProduct = async (productData: Omit<Product, "_id" | "rating" | "reviews">) => {
    try {
      const response = await fetch(`${config.API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add product");
      }

      const newProduct = await response.json();
      setProducts((prev) => [...prev, newProduct]);
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const response = await fetch(`${config.API_URL}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update product");
      }

      const updated = await response.json();
      setProducts((prev) => prev.map((p) => (p._id === productId ? updated : p)));
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`${config.API_URL}/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete product");
      }

      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  const toggleProductStock = async (productId: string) => {
    try {
      const response = await fetch(`${config.API_URL}/products/${productId}/stock`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to toggle stock");
      }

      const updated = await response.json();
      setProducts((prev) => prev.map((p) => (p._id === productId ? updated : p)));
    } catch (error) {
      console.error("Error toggling stock:", error);
      throw error;
    }
  };

  // ---------------- CATEGORY CRUD ----------------
  const addCategory = async (categoryData: Omit<Category, "_id" | "productCount">) => {
    try {
      const response = await fetch(`${config.API_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add category");
      }

      const newCategory = await response.json();
      setCategories((prev) => [...prev, newCategory]);
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    }
  };

  const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
    try {
      const response = await fetch(`${config.API_URL}/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update category");
      }

      const updated = await response.json();
      setCategories((prev) => prev.map((c) => (c._id === categoryId ? updated : c)));
      
      // Refresh products to get updated category names
      const productsResponse = await fetch(`${config.API_URL}/products`);
      const productsData = await productsResponse.json();
      setProducts(productsData);
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`${config.API_URL}/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete category");
      }

      setCategories((prev) => prev.filter((c) => c._id !== categoryId));
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
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
        isLoading,
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
