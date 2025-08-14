import React from "react";
import { HashRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { configureStore, createSlice, createSelector } from "@reduxjs/toolkit";
import { ShoppingCart } from "lucide-react";

// --- Produktdaten (lokale Bilder im public/plants/ Ordner) ---
const PRODUCTS = [
  {
    id: "monstera",
    name: "Monstera Deliciosa",
    price: 24.99,
    category: "Pflegeleicht",
    image: "/plants/monstera.jpg",
  },
  {
    id: "ficus",
    name: "Ficus Elastica",
    price: 29.99,
    category: "Luftreiniger",
    image: "/plants/ficus.jpg",
  },
  {
    id: "snake",
    name: "Sansevieria (Bogenhanf)",
    price: 19.99,
    category: "Pflegeleicht",
    image: "/plants/sansevieria.jpg",
  },
  {
    id: "calathea",
    name: "Calathea Orbifolia",
    price: 34.99,
    category: "Schattentolerant",
    image: "/plants/calathea.jpg",
  },
  {
    id: "pothos",
    name: "Epipremnum (Efeutute)",
    price: 14.99,
    category: "Hängepflanzen",
    image: "/plants/pothos.jpg",
  },
  {
    id: "zz",
    name: "Zamioculcas Zamiifolia",
    price: 22.99,
    category: "Schattentolerant",
    image: "/plants/zz.jpg",
  },
];

// --- Redux Slice ---
const cartSlice = createSlice({
  name: "cart",
  initialState: { items: {} },
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      if (!state.items[product.id]) {
        state.items[product.id] = { product, qty: 1 };
      }
    },
    increment: (state, action) => {
      const id = action.payload;
      const item = state.items[id];
      if (item) item.qty += 1;
    },
    decrement: (state, action) => {
      const id = action.payload;
      const item = state.items[id];
      if (item) {
        item.qty -= 1;
        if (item.qty <= 0) delete state.items[id];
      }
    },
    remove: (state, action) => {
      delete state.items[action.payload];
    },
    clear: (state) => {
      state.items = {};
    },
  },
});

const { addToCart, increment, decrement, remove, clear } = cartSlice.actions;
const store = configureStore({ reducer: { cart: cartSlice.reducer } });

// --- Selectors ---
const selectItems = (state) => state.cart.items;
const selectCartArray = createSelector([selectItems], (items) => Object.values(items));
const selectTotalCount = createSelector([selectCartArray], (arr) => arr.reduce((sum, it) => sum + it.qty, 0));
const selectTotalCost = createSelector([selectCartArray], (arr) =>
  arr.reduce((sum, it) => sum + it.qty * it.product.price, 0)
);

// --- Layout & Header ---
function Header() {
  const count = useSelector(selectTotalCount);
  return (
    <header className="w-full border-b bg-white/70 backdrop-blur sticky top-0 z-30">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
        <Link to="/products" className="font-extrabold text-2xl tracking-tight">
          Greenify Co.
        </Link>
        <nav className="flex items-center gap-4">
          <Link className="hover:underline" to="/products">
            Produkte
          </Link>
          <Link className="relative" to="/cart" aria-label="Warenkorb">
            <ShoppingCart className="w-6 h-6" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 text-xs font-semibold bg-black text-white rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Layout({ children }) {
  const { pathname } = useLocation();
  const showHeader = pathname === "/products" || pathname === "/cart";
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className="flex-1">{children}</main>
      <footer className="border-t text-center text-sm text-gray-600 py-6">
        © {new Date().getFullYear()} Greenify Co.
      </footer>
    </div>
  );
}

// --- Pages ---
function LandingPage() {
  return (
    <section
      className="min-h-[80vh] flex items-center justify-center text-center px-6"
      style={{
        backgroundImage: "url(/plants/landing-bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white/80 backdrop-blur rounded-2xl p-10 max-w-2xl shadow-xl">
        <h1 className="text-4xl font-extrabold mb-3">Greenify Co.</h1>
        <p className="text-lg mb-6">
          Wir bringen frisches Grün in dein Zuhause – robuste, luftreinigende und wunderschöne Zimmerpflanzen,
          sorgfältig ausgewählt für jeden Lichttyp.
        </p>
        <Link
          to="/products"
          className="inline-block rounded-2xl shadow px-6 py-3 bg-black text-white font-semibold hover:opacity-90"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}

function ProductsPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectItems);
  const categories = Array.from(new Set(PRODUCTS.map((p) => p.category)));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-6">Unsere Pflanzen</h2>
      <div className="space-y-10">
        {categories.map((cat) => (
          <section key={cat}>
            <h3 className="text-xl font-semibold mb-4">{cat}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {PRODUCTS.filter((p) => p.category === cat).map((p) => {
                const inCart = Boolean(items[p.id]);
                return (
                  <div key={p.id} className="border rounded-2xl overflow-hidden shadow-sm bg-white">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-16 object-cover"
                    />
                    <div className="p-4">
                      <div className="font-semibold text-lg">{p.name}</div>
                      <div className="text-sm text-gray-600 mb-3">€ {p.price.toFixed(2)}</div>
                      <button
                        className={`w-full rounded-xl px-4 py-2 font-medium border transition ${
                          inCart
                            ? "opacity-60 cursor-not-allowed bg-gray-100"
                            : "bg-black text-white hover:opacity-90"
                        }`}
                        disabled={inCart}
                        onClick={() => dispatch(addToCart(p))}
                      >
                        {inCart ? "Im Warenkorb" : "In den Warenkorb"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function CartPage() {
  const itemsArr = useSelector(selectCartArray);
  const totalCount = useSelector(selectTotalCount);
  const totalCost = useSelector(selectTotalCost);
  const dispatch = useDispatch();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-6">Dein Warenkorb</h2>

      <div className="mb-4 text-gray-700">Gesamtanzahl: <strong>{totalCount}</strong></div>
      <div className="mb-6 text-gray-700">Gesamtkosten: <strong>€ {totalCost.toFixed(2)}</strong></div>

      {itemsArr.length === 0 ? (
        <div className="border rounded-2xl p-6 text-center">
          Dein Warenkorb ist leer.
          <div className="mt-4">
            <Link to="/products" className="underline font-medium">Weiter einkaufen</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {itemsArr.map(({ product, qty }) => (
            <div key={product.id} className="flex items-center gap-4 border rounded-2xl p-4 bg-white shadow-sm">
              <img
                src={product.image}
                alt={product.name}
                className="w-40 h-28 object-cover rounded-xl"
              />
              <div className="flex-1">
                <div className="font-semibold">{product.name}</div>
                <div className="text-sm text-gray-600">Stückpreis: € {product.price.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 rounded-lg border"
                  onClick={() => dispatch(decrement(product.id))}
                >
                  −
                </button>
                <div className="w-8 text-center font-semibold">{qty}</div>
                <button
                  className="px-3 py-1 rounded-lg border"
                  onClick={() => dispatch(increment(product.id))}
                >
                  +
                </button>
              </div>
              <button
                className="ml-4 px-3 py-1 rounded-lg border text-red-600"
                onClick={() => dispatch(remove(product.id))}
              >
                Löschen
              </button>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
            <Link to="/products" className="rounded-xl px-4 py-2 border font-medium hover:bg-gray-50">
              Weiter einkaufen
            </Link>
            <div className="flex items-center gap-3">
              <button
                className="rounded-xl px-4 py-2 border"
                onClick={() => alert("Checkout kommt bald!")}
              >
                Bezahlen
              </button>
              <button
                className="rounded-xl px-4 py-2 border text-gray-600"
                onClick={() => dispatch(clear())}
              >
                Warenkorb leeren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Root App ---
function AppInner() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <AppInner />
        </Layout>
      </Router>
    </Provider>
  );
}
