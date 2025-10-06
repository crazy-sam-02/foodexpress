
// import { Product } from '@/types';

// export const products: Product[] = [
//   // Cakes
//   {
//     id: 1,
//     name: "Chocolate Fudge Cake",
//     description: "Rich, moist chocolate cake with creamy fudge frosting",
//     price: 35.99,
//     image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
//     category: "Cakes",
//     inStock: true,
//     rating: 4.9,
//     reviews: 156,
//     tags: ["chocolate", "birthday", "celebration"]
//   },
//   {
//     id: 2,
//     name: "Vanilla Bean Cake",
//     description: "Classic vanilla cake with buttercream frosting",
//     price: 32.99,
//     image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop",
//     category: "Cakes",
//     inStock: true,
//     rating: 4.8,
//     reviews: 89,
//     tags: ["vanilla", "classic", "birthday"]
//   },
//   {
//     id: 3,
//     name: "Red Velvet Cake",
//     description: "Southern-style red velvet with cream cheese frosting",
//     price: 38.99,
//     image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&h=300&fit=crop",
//     category: "Cakes",
//     inStock: true,
//     rating: 4.7,
//     reviews: 134,
//     tags: ["red velvet", "cream cheese", "southern"]
//   },
//   {
//     id: 4,
//     name: "Carrot Cake",
//     description: "Spiced carrot cake with walnuts and cream cheese frosting",
//     price: 34.99,
//     image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop",
//     category: "Cakes",
//     inStock: true,
//     rating: 4.6,
//     reviews: 78,
//     tags: ["carrot", "spiced", "nuts"]
//   },
//   {
//     id: 5,
//     name: "Lemon Drizzle Cake",
//     description: "Zesty lemon cake with sweet lemon glaze",
//     price: 29.99,
//     image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop",
//     category: "Cakes",
//     inStock: true,
//     rating: 4.8,
//     reviews: 92,
//     tags: ["lemon", "citrus", "glaze"]
//   },

//   // Cupcakes
//   {
//     id: 6,
//     name: "Chocolate Cupcakes (6-pack)",
//     description: "Mini chocolate cakes with chocolate buttercream",
//     price: 18.99,
//     image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&h=300&fit=crop",
//     category: "Cupcakes",
//     inStock: true,
//     rating: 4.9,
//     reviews: 203,
//     tags: ["chocolate", "mini", "pack"]
//   },
//   {
//     id: 7,
//     name: "Vanilla Cupcakes (6-pack)",
//     description: "Classic vanilla cupcakes with vanilla frosting",
//     price: 16.99,
//     image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=400&h=300&fit=crop",
//     category: "Cupcakes",
//     inStock: true,
//     rating: 4.7,
//     reviews: 167,
//     tags: ["vanilla", "classic", "pack"]
//   },
//   {
//     id: 8,
//     name: "Strawberry Cupcakes (6-pack)",
//     description: "Fresh strawberry cupcakes with strawberry cream frosting",
//     price: 19.99,
//     image: "https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400&h=300&fit=crop",
//     category: "Cupcakes",
//     inStock: true,
//     rating: 4.8,
//     reviews: 145,
//     tags: ["strawberry", "fresh", "cream"]
//   },
//   {
//     id: 9,
//     name: "Red Velvet Cupcakes (6-pack)",
//     description: "Mini red velvet cakes with cream cheese frosting",
//     price: 20.99,
//     image: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&h=300&fit=crop",
//     category: "Cupcakes",
//     inStock: true,
//     rating: 4.9,
//     reviews: 189,
//     tags: ["red velvet", "cream cheese", "mini"]
//   },
//   {
//     id: 10,
//     name: "Lemon Cupcakes (6-pack)",
//     description: "Zesty lemon cupcakes with lemon buttercream",
//     price: 17.99,
//     image: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=400&h=300&fit=crop",
//     category: "Cupcakes",
//     inStock: true,
//     rating: 4.6,
//     reviews: 98,
//     tags: ["lemon", "zesty", "buttercream"]
//   },

//   // Cookies
//   {
//     id: 11,
//     name: "Chocolate Chip Cookies (12-pack)",
//     description: "Classic chocolate chip cookies, soft and chewy",
//     price: 12.99,
//     image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop",
//     category: "Cookies",
//     inStock: true,
//     rating: 4.8,
//     reviews: 267,
//     tags: ["chocolate chip", "classic", "chewy"]
//   },
//   {
//     id: 12,
//     name: "Oatmeal Raisin Cookies (12-pack)",
//     description: "Hearty oatmeal cookies with plump raisins",
//     price: 11.99,
//     image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop",
//     category: "Cookies",
//     inStock: true,
//     rating: 4.5,
//     reviews: 123,
//     tags: ["oatmeal", "raisin", "hearty"]
//   },
//   {
//     id: 13,
//     name: "Sugar Cookies (12-pack)",
//     description: "Soft sugar cookies with colorful icing",
//     price: 13.99,
//     image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&h=300&fit=crop",
//     category: "Cookies",
//     inStock: true,
//     rating: 4.7,
//     reviews: 145,
//     tags: ["sugar", "icing", "colorful"]
//   },
//   {
//     id: 14,
//     name: "Double Chocolate Cookies (12-pack)",
//     description: "Rich chocolate cookies with chocolate chips",
//     price: 14.99,
//     image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop",
//     category: "Cookies",
//     inStock: true,
//     rating: 4.9,
//     reviews: 201,
//     tags: ["double chocolate", "rich", "chips"]
//   },
//   {
//     id: 15,
//     name: "Snickerdoodles (12-pack)",
//     description: "Cinnamon sugar cookies, soft and sweet",
//     price: 12.99,
//     image: "https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400&h=300&fit=crop",
//     category: "Cookies",
//     inStock: true,
//     rating: 4.6,
//     reviews: 87,
//     tags: ["cinnamon", "sugar", "soft"]
//   },

//   // Pastries
//   {
//     id: 16,
//     name: "Croissants (6-pack)",
//     description: "Buttery, flaky French croissants",
//     price: 15.99,
//     image: "https://images.unsplash.com/photo-1555507036-ab794f4ca1c3?w=400&h=300&fit=crop",
//     category: "Pastries",
//     inStock: true,
//     rating: 4.8,
//     reviews: 156,
//     tags: ["croissant", "buttery", "french"]
//   },
//   {
//     id: 17,
//     name: "Danish Pastries (4-pack)",
//     description: "Assorted fruit-filled Danish pastries",
//     price: 13.99,
//     image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=300&fit=crop",
//     category: "Pastries",
//     inStock: true,
//     rating: 4.7,
//     reviews: 98,
//     tags: ["danish", "fruit", "assorted"]
//   },
//   {
//     id: 18,
//     name: "Éclairs (4-pack)",
//     description: "Choux pastry filled with cream and topped with chocolate",
//     price: 16.99,
//     image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop",
//     category: "Pastries",
//     inStock: true,
//     rating: 4.9,
//     reviews: 134,
//     tags: ["eclair", "cream", "chocolate"]
//   },
//   {
//     id: 19,
//     name: "Cinnamon Rolls (6-pack)",
//     description: "Warm cinnamon rolls with sweet glaze",
//     price: 14.99,
//     image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop",
//     category: "Pastries",
//     inStock: true,
//     rating: 4.8,
//     reviews: 178,
//     tags: ["cinnamon", "roll", "glaze"]
//   },
//   {
//     id: 20,
//     name: "Apple Turnovers (4-pack)",
//     description: "Flaky pastry with spiced apple filling",
//     price: 12.99,
//     image: "https://images.unsplash.com/photo-1605443505169-bdebbdeea7d4?w=400&h=300&fit=crop",
//     category: "Pastries",
//     inStock: true,
//     rating: 4.6,
//     reviews: 89,
//     tags: ["apple", "turnover", "spiced"]
//   },

//   // Breads
//   {
//     id: 21,
//     name: "Artisan Sourdough Loaf",
//     description: "Traditional sourdough bread with crispy crust",
//     price: 8.99,
//     image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
//     category: "Breads",
//     inStock: true,
//     rating: 4.7,
//     reviews: 123,
//     tags: ["sourdough", "artisan", "crispy"]
//   },
//   {
//     id: 22,
//     name: "Whole Wheat Bread",
//     description: "Healthy whole wheat bread, perfect for sandwiches",
//     price: 6.99,
//     image: "https://images.unsplash.com/photo-1586444248902-2d2a4e0b0efe?w=400&h=300&fit=crop",
//     category: "Breads",
//     inStock: true,
//     rating: 4.5,
//     reviews: 76,
//     tags: ["whole wheat", "healthy", "sandwich"]
//   },
//   {
//     id: 23,
//     name: "French Baguette",
//     description: "Classic French baguette with golden crust",
//     price: 4.99,
//     image: "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=400&h=300&fit=crop",
//     category: "Breads",
//     inStock: true,
//     rating: 4.8,
//     reviews: 145,
//     tags: ["french", "baguette", "golden"]
//   },
//   {
//     id: 24,
//     name: "Cinnamon Raisin Bread",
//     description: "Sweet bread with cinnamon swirl and raisins",
//     price: 7.99,
//     image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop",
//     category: "Breads",
//     inStock: true,
//     rating: 4.6,
//     reviews: 92,
//     tags: ["cinnamon", "raisin", "sweet"]
//   },
//   {
//     id: 25,
//     name: "Multi-Grain Bread",
//     description: "Nutritious bread with seeds and grains",
//     price: 8.49,
//     image: "https://images.unsplash.com/photo-1574635542833-13c4b21e2f40?w=400&h=300&fit=crop",
//     category: "Breads",
//     inStock: true,
//     rating: 4.4,
//     reviews: 67,
//     tags: ["multi-grain", "seeds", "nutritious"]
//   },

//   // Pies
//   {
//     id: 26,
//     name: "Apple Pie",
//     description: "Classic apple pie with lattice crust",
//     price: 24.99,
//     image: "https://images.unsplash.com/photo-1621743478914-cc8a86d7e9b5?w=400&h=300&fit=crop",
//     category: "Pies",
//     inStock: true,
//     rating: 4.9,
//     reviews: 189,
//     tags: ["apple", "classic", "lattice"]
//   },
//   {
//     id: 27,
//     name: "Pumpkin Pie",
//     description: "Smooth pumpkin pie with spiced filling",
//     price: 22.99,
//     image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop",
//     category: "Pies",
//     inStock: true,
//     rating: 4.7,
//     reviews: 134,
//     tags: ["pumpkin", "spiced", "smooth"]
//   },
//   {
//     id: 28,
//     name: "Pecan Pie",
//     description: "Rich pecan pie with caramelized filling",
//     price: 26.99,
//     image: "https://images.unsplash.com/photo-1605443505169-bdebbdeea7d4?w=400&h=300&fit=crop",
//     category: "Pies",
//     inStock: true,
//     rating: 4.8,
//     reviews: 112,
//     tags: ["pecan", "rich", "caramelized"]
//   },
//   {
//     id: 29,
//     name: "Cherry Pie",
//     description: "Tart cherry pie with sweet crumb topping",
//     price: 23.99,
//     image: "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=400&h=300&fit=crop",
//     category: "Pies",
//     inStock: true,
//     rating: 4.6,
//     reviews: 98,
//     tags: ["cherry", "tart", "crumb"]
//   },
//   {
//     id: 30,
//     name: "Key Lime Pie",
//     description: "Tangy key lime pie with graham cracker crust",
//     price: 21.99,
//     image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop",
//     category: "Pies",
//     inStock: true,
//     rating: 4.8,
//     reviews: 145,
//     tags: ["key lime", "tangy", "graham"]
//   },

//   // Muffins
//   {
//     id: 31,
//     name: "Blueberry Muffins (6-pack)",
//     description: "Fresh blueberry muffins with streusel topping",
//     price: 13.99,
//     image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop",
//     category: "Muffins",
//     inStock: true,
//     rating: 4.7,
//     reviews: 156,
//     tags: ["blueberry", "streusel", "fresh"]
//   },
//   {
//     id: 32,
//     name: "Chocolate Chip Muffins (6-pack)",
//     description: "Moist muffins loaded with chocolate chips",
//     price: 14.99,
//     image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&h=300&fit=crop",
//     category: "Muffins",
//     inStock: true,
//     rating: 4.8,
//     reviews: 178,
//     tags: ["chocolate chip", "moist", "loaded"]
//   },
//   {
//     id: 33,
//     name: "Banana Nut Muffins (6-pack)",
//     description: "Banana muffins with walnuts and cinnamon",
//     price: 13.49,
//     image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop",
//     category: "Muffins",
//     inStock: true,
//     rating: 4.6,
//     reviews: 89,
//     tags: ["banana", "walnut", "cinnamon"]
//   }
// ];

// export const categories = [
//   {
//     id: 1,
//     name: "Cakes",
//     description: "Celebration cakes for all occasions",
//     image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
//     productCount: products.filter(p => p.category === "Cakes").length
//   },
//   {
//     id: 2,
//     name: "Cupcakes",
//     description: "Individual treats perfect for sharing",
//     image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&h=300&fit=crop",
//     productCount: products.filter(p => p.category === "Cupcakes").length
//   },
//   {
//     id: 3,
//     name: "Cookies",
//     description: "Classic cookies baked fresh daily",
//     image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop",
//     productCount: products.filter(p => p.category === "Cookies").length
//   },
//   {
//     id: 4,
//     name: "Pastries",
//     description: "Delicate pastries and morning treats",
//     image: "https://images.unsplash.com/photo-1555507036-ab794f4ca1c3?w=400&h=300&fit=crop",
//     productCount: products.filter(p => p.category === "Pastries").length
//   },
//   {
//     id: 5,
//     name: "Breads",
//     description: "Artisan breads baked fresh daily",
//     image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
//     productCount: products.filter(p => p.category === "Breads").length
//   },
//   {
//     id: 6,
//     name: "Pies",
//     description: "Traditional pies with flaky crusts",
//     image: "https://images.unsplash.com/photo-1621743478914-cc8a86d7e9b5?w=400&h=300&fit=crop",
//     productCount: products.filter(p => p.category === "Pies").length
//   },
//   {
//     id: 7,
//     name: "Muffins",
//     description: "Breakfast muffins and sweet treats",
//     image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop",
//     productCount: products.filter(p => p.category === "Muffins").length
//   }
// ];
