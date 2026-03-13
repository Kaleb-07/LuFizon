import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutGrid,
  Heart,
  Star,
  Filter,
  ArrowLeft,
  ArrowRight,
  Menu,
  Check,
  ChevronDown,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Headphones,
  RotateCcw
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { mockProducts } from "../../lib/mock-data";
import { useCart } from "../../contexts/CartContext";
import { Button } from "../../components/ecommerce/ecommerce-ui/button";
import { Card, CardContent } from "../../components/ecommerce/ecommerce-ui/card";
import { Input } from "../../components/ecommerce/ecommerce-ui/input";
import Navbar from "../../components/ecommerce/Navbar";
import Footer from "../../components/ecommerce/Footer";
import { useLanguage } from "../../contexts/LanguageContext";

const CATEGORIES = [
  "All Products",
  "Electronics",
  "Fashion",
  "Bags",
  "Shoes",
  "Accessories",
  "Home & Living",
  "Beauty",
  "Sports",
  "Gadgets",
  "Lifestyle",
];

const BAG_TYPES = ["Backpack", "Handbag", "Laptop Bag", "Travel Bag", "Messenger Bag"];
const BRANDS = ["Nike", "Adidas", "Apple", "Samsung", "Zara", "Gucci", "Sony"];

const StorePage = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [visibleItems, setVisibleItems] = useState(12);

  // Sync searchQuery and selectedCategory with URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    const cat = params.get("category");

    setSearchQuery(q);
    
    if (cat && CATEGORIES.includes(cat)) {
      setSelectedCategory(cat);
    } else if (!cat) {
      setSelectedCategory("All Products");
    }
  }, [location.search]);

  const availableTypes = useMemo(() => {
    if (selectedCategory === "All Products") return [];
    const types = mockProducts
      .filter((p) => p.category_name === selectedCategory && p.part_number)
      .map((p) => p.part_number);
    return Array.from(new Set(types));
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    let products = [...mockProducts];

    // --- 1. Advanced Deep Search ---
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      products = products.filter((p) =>
        p.item_name.toLowerCase().includes(q) ||
        (p.brand_name && p.brand_name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // --- 2. Category ---
    if (selectedCategory !== "All Products") {
      products = products.filter((p) => p.category_name === selectedCategory);
    }

    // --- 3. Price Range ---
    products = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // --- 4. Drill-down Filters ---
    if (selectedTypes.length > 0) {
      products = products.filter((p) => p.part_number && selectedTypes.includes(p.part_number));
    }

    if (selectedBrands.length > 0) {
      products = products.filter((p) => p.brand_name && selectedBrands.includes(p.brand_name));
    }

    // --- 5. Advanced Sorting ---
    if (sortBy === "Price: Low to High") {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === "Popularity") {
      products.sort((a, b) => ((b.id % 10) + b.price / 1000) - ((a.id % 10) + a.price / 1000));
    } else if (sortBy === "Best Rated") {
      products.sort((a, b) => (b.id % 5) - (a.id % 5));
    }

    return products;
  }, [selectedCategory, selectedTypes, selectedBrands, sortBy, searchQuery, priceRange]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, b]
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-neutral-50/50 pb-12 pt-20">
        <div className="max-w-[1700px] mx-auto px-6 mt-0">
          <div className="flex flex-col lg:flex-row gap-6 transition-all duration-500">

            {/* --- SIDEBAR --- */}
            <aside
              className={`shrink-0 transition-all duration-500 ease-in-out z-30 ${(isSidebarExpanded || selectedCategory !== "All Products") ? "lg:w-1/4 opacity-100" : "lg:w-0 opacity-0"
                }`}
              onMouseLeave={() => {
                if (selectedCategory === "All Products") setIsSidebarExpanded(false);
              }}
            >
              <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide pr-2">
                <AnimatePresence mode="wait">
                  {selectedCategory === "All Products" ? (
                    isSidebarExpanded && (
                      <motion.div
                        key="category-menu"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-[2rem] shadow-xl shadow-neutral-200/50 border border-neutral-100 p-4"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-2 mb-2">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
                              Select Category
                            </h4>
                            <Menu className="h-4 w-4 text-neutral-300" />
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            {CATEGORIES.filter(c => c !== "All Products").map((cat, idx) => (
                              <motion.button
                                key={cat}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setIsSidebarExpanded(false);
                                }}
                                className="w-full text-left px-4 py-3 rounded-xl transition-all hover:bg-primary/5 hover:text-primary group flex items-center justify-between"
                              >
                                <span className="text-sm font-semibold text-neutral-600 group-hover:text-primary">
                                  {cat}
                                </span>
                                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )
                  ) : (
                    <motion.div
                      key="filter-menu"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white rounded-[2rem] shadow-xl shadow-neutral-200/50 border border-neutral-100 p-6 space-y-8"
                    >
                      {/* Back Button */}
                      <motion.button
                        whileHover={{ scale: 1.05, x: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCategory("All Products")}
                        className="flex items-center gap-2 text-primary font-bold text-sm tracking-tight mb-4 group"
                      >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Categories
                      </motion.button>

                      <div className="space-y-6">
                        <div className="pb-4 border-b border-neutral-100 px-2">
                          <h3 className="text-xl font-black text-neutral-900">Filters</h3>
                          <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">Refine {selectedCategory}</p>
                        </div>

                        {availableTypes.length > 0 && (
                          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 px-2">
                              Select Type
                            </h4>
                            <div className="space-y-1">
                              {availableTypes.map((type) => (
                                <button
                                  key={type}
                                  onClick={() => toggleType(type)}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${selectedTypes.includes(type)
                                    ? "bg-primary/5 text-primary shadow-sm"
                                    : "text-neutral-500 hover:bg-neutral-50"
                                    }`}
                                >
                                  <div className={`h-4 w-4 rounded border transition-all flex items-center justify-center ${selectedTypes.includes(type) ? "bg-primary border-primary" : "border-neutral-200"
                                    }`}>
                                    {selectedTypes.includes(type) && <Check className="h-2.5 w-2.5 text-white" />}
                                  </div>
                                  <span className="text-sm font-bold tracking-tight">{type}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 px-2">
                            Select Brand
                          </h4>
                          <div className="space-y-1">
                            {BRANDS.map((brand) => (
                              <button
                                key={brand}
                                onClick={() => toggleBrand(brand)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${selectedBrands.includes(brand)
                                  ? "bg-primary/5 text-primary shadow-sm"
                                  : "text-neutral-500 hover:bg-neutral-50"
                                  }`}
                              >
                                <div className={`h-4 w-4 rounded border transition-all flex items-center justify-center ${selectedBrands.includes(brand) ? "bg-primary border-primary" : "border-neutral-200"
                                  }`}>
                                  {selectedBrands.includes(brand) && <Check className="h-2.5 w-2.5 text-white" />}
                                </div>
                                <span className="text-sm font-bold tracking-tight">{brand}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Price Range Filter */}
                        <div className="pt-4">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-6 px-2">
                            Price Range (ETB)
                          </h4>
                          <div className="px-2 space-y-6">
                            <div className="flex gap-4">
                              <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-bold text-neutral-400 uppercase">Min</label>
                                <Input
                                  type="number"
                                  value={priceRange[0]}
                                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                  className="h-10 rounded-xl"
                                />
                              </div>
                              <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-bold text-neutral-400 uppercase">Max</label>
                                <Input
                                  type="number"
                                  value={priceRange[1]}
                                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                  className="h-10 rounded-xl"
                                />
                              </div>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10000"
                              step="100"
                              value={priceRange[1]}
                              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {selectedCategory !== "All Products" && (
                  <motion.nav
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6"
                  >
                    <Link to="/shop" className="hover:text-primary transition-colors">Store</Link>
                    <ChevronDown className="h-3 w-3 -rotate-90" />
                    <button
                      onClick={() => {
                        setSelectedCategory("All Products");
                        setSelectedTypes([]);
                        setSelectedBrands([]);
                      }}
                      className="hover:text-primary transition-colors"
                    >
                      All Categories
                    </button>
                    <ChevronDown className="h-3 w-3 -rotate-90" />
                    <span className="text-primary">{selectedCategory}</span>
                  </motion.nav>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-4 mb-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  {!isSidebarExpanded && selectedCategory === "All Products" && (
                    <motion.div
                      layout
                      onMouseEnter={() => setIsSidebarExpanded(true)}
                      className="lg:w-[260px] shrink-0 bg-white rounded-[2rem] shadow-xl shadow-neutral-200/50 border border-neutral-100 p-6"
                    >
                      <div className="space-y-4 text-center">
                        <div className="space-y-1 mb-6">
                          <h3 className="font-bold text-neutral-900">All Categories</h3>
                          <p className="text-xs text-neutral-500 font-medium italic">Explore our curated collection</p>
                        </div>
                        <Button
                          className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-white font-bold tracking-tight flex items-center justify-center gap-3"
                        >
                          <Search className="h-5 w-5" />
                          All Categories
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex-1">
                    <h1 className="text-5xl font-black text-neutral-900 tracking-tightest leading-none">
                      {selectedCategory === "All Products" ? (t ? t("nav.store") : "Store") : selectedCategory}
                    </h1>
                    <p className="text-neutral-400 text-lg font-medium mt-3 max-w-2xl">
                      {searchQuery
                        ? `Showing results for "${searchQuery}"`
                        : (selectedCategory === "All Products"
                          ? "Browse our complete collection of premium products, designed for excellence."
                          : `Discover the finest selection of ${selectedCategory.toLowerCase()} carefully curated for you.`)}
                    </p>
                  </div>
                </div>

                {/* Professional Benefits Bar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                  {[
                    { icon: Truck, label: "Free Delivery", sub: "Orders over ETB 2k" },
                    { icon: ShieldCheck, label: "Secure Payment", sub: "SSL Encrypted" },
                    { icon: Headphones, label: "24/7 Support", sub: "Dedicated Help" },
                    { icon: RotateCcw, label: "Easy Returns", sub: "30-Day Window" },
                  ].map((feature, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (i * 0.1) }}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/50 border border-neutral-100 shadow-sm transition-all hover:bg-white hover:shadow-md hover:border-primary/20 group cursor-default"
                    >
                      <div className="h-9 w-9 shrink-0 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                        <feature.icon className="h-4 w-4 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-black text-neutral-900 leading-tight truncate">{feature.label}</p>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tighter truncate">{feature.sub}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-neutral-100 mt-0 px-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
                      {filteredProducts.length} Premium Items
                    </span>
                  </div>

                  <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-neutral-100 shadow-sm transition-all hover:bg-white hover:shadow-md">
                    <Filter className="h-4 w-4 text-primary" />
                    <div className="h-4 w-[1px] bg-neutral-100" />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Sort</span>
                      <select
                        className="bg-transparent font-bold text-neutral-800 focus:outline-none cursor-pointer text-sm"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option>Newest</option>
                        <option>Popularity</option>
                        <option>Best Rated</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${isSidebarExpanded ? "xl:grid-cols-3" : "xl:grid-cols-4"} gap-8 transition-all duration-500`}>
                <AnimatePresence mode="popLayout">
                  {filteredProducts.slice(0, visibleItems).map((product, idx) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                    >
                      <Link to={`/shop/product/${product.id}`}>
                        <Card className="group relative h-full overflow-hidden border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-3xl">
                          <div className="relative aspect-square overflow-hidden bg-neutral-100">
                            <img
                              src={product.images?.[0] || "/images/default.jpg"}
                              alt={product.item_name}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <button
                              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors shadow-sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <Heart className="h-5 w-5" />
                            </button>
                          </div>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-1">
                                  {product.brand_name || "Premium Brand"}
                                </p>
                                <h3 className="font-bold text-neutral-900 text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                  {product.item_name}
                                </h3>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < 4
                                        ? "fill-primary text-primary"
                                        : "fill-neutral-200 text-neutral-200"
                                        }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[12px] text-neutral-400 font-medium">
                                  ({(product.id % 20) + 10} reviews)
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-2">
                                <span className="text-2xl font-black text-neutral-900">
                                  ETB {product.price}
                                </span>
                                <Button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    addToCart(product);
                                  }}
                                  className="h-10 px-4 rounded-xl bg-neutral-900 hover:bg-primary text-white text-[12px] font-bold transition-all shadow-lg shadow-neutral-200 flex items-center gap-2 group/btn"
                                >
                                  <ShoppingBag className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                                  Add to Cart
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Load More */}
              {visibleItems < filteredProducts.length && (
                <div className="mt-20 flex justify-center">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setVisibleItems((prev) => prev + 12)}
                    className="rounded-full px-12 h-14 border-2 border-neutral-200 hover:border-primary hover:text-primary transition-all text-neutral-600 font-bold"
                  >
                    Load More Products
                  </Button>
                </div>
              )}

              {filteredProducts.length === 0 && (
                <div className="text-center py-40 border-2 border-dashed border-neutral-200 rounded-3xl">
                  <Filter className="h-16 w-16 text-neutral-200 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-neutral-400">No products found</h3>
                  <p className="text-neutral-400 mt-2">Try adjusting your filters or search query.</p>
                  <Button
                    variant="link"
                    className="mt-4 text-primary font-bold"
                    onClick={() => {
                      setSelectedCategory("All Products");
                      setSelectedTypes([]);
                      setSelectedBrands([]);
                      setSearchQuery("");
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StorePage;
