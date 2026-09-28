"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronRight, Menu, Minus, Plus, Search, ShoppingBag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Product = {
  id: string; name: string; price: number; category: string; material: string;
  description: string; position: string; image?: string; secondary?: string;
  options?: string[]; soldOut?: boolean; badge?: string;
};

type CartItem = { id: string; option: string; qty: number };
type Route = { page: "home" | "shop" | "product" | "about"; productId?: string };
type WebMcpTool = {
  name: string; title: string; description: string; inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
};
type WebMcpDocument = Document & { modelContext?: { registerTool: (tool: WebMcpTool, options: { signal: AbortSignal }) => void | Promise<void> } };

const products: Product[] = [
  { id: "silver-cake-server", name: "트위스트 스템 케이크 서버", price: 52000, category: "Cutlery", material: "Silver", description: "꼬임이 있는 스템과 절제된 투각 장식이 테이블에 선명한 표정을 더하는 서버입니다.", position: "center", image: "/twist-cake-server.png", secondary: "/server-story.png", badge: "Editor's Pick" },
  { id: "burgundy-botanical-plate", name: "아이보리 보태니컬 플레이트", price: 38000, category: "Plates & Bowls", material: "Ceramic", description: "웜 아이보리 바탕에 가느다란 버건디 식물 문양을 두른 디저트 접시입니다.", position: "center", image: "/neutral-botanical-plate.png", secondary: "/served-neutral-berry-tart.png", options: ["1P", "2P"] },
  { id: "forest-glass-dome", name: "클리어 리브드 케이크 돔", price: 128000, category: "Serving Objects", material: "Glass", description: "투명한 세로 결의 유리와 작은 올리브 노브가 담긴 케이크 돔 세트입니다.", position: "center", image: "/neutral-glass-dome.png", secondary: "/served-neutral-cake-dome.png", options: ["Dome + Stand"] },
  { id: "amber-dessert-coupe", name: "허니 풋 디저트 쿠페", price: 48000, category: "Cups & Glasses", material: "Glass", description: "투명한 플루트 볼과 옅은 허니빛 스템이 가볍게 포인트가 되는 디저트 쿠페입니다.", position: "center", image: "/neutral-glass-coupe.png", secondary: "/served-neutral-jelly.png" },
  { id: "cobalt-espresso-cup", name: "블루 라인 패싯 컵 & 소서", price: 42000, category: "Cups & Glasses", material: "Ceramic", description: "아이보리 유약 위에 얇은 블루 라인을 더한 각진 컵과 소서 세트입니다.", position: "center", image: "/neutral-blue-cup.png", secondary: "/served-neutral-pastry.png", options: ["Cup + Saucer"] },
  { id: "shell-relief-plate", name: "쉘 릴리프 디저트 플레이트", price: 42000, category: "Plates & Bowls", material: "Ceramic", description: "조개를 닮은 낮은 부조와 가느다란 버건디 라인이 디저트에 입체적인 배경을 만듭니다.", position: "center", image: "/shell-relief-plate.png", options: ["1P", "2P"], badge: "New" },
  { id: "smoke-twist-goblets", name: "스모크 트위스트 고블렛 2P", price: 62000, category: "Cups & Glasses", material: "Glass", description: "옅은 스모크 컬러와 꼬인 스템, 얕은 패싯 볼이 특징인 디저트 고블렛 두 개 구성입니다.", position: "center", image: "/smoke-twist-goblets.png", options: ["2P Set"] },
  { id: "olive-bead-teacup", name: "올리브 비드 티컵 & 소서", price: 44000, category: "Cups & Glasses", material: "Ceramic", description: "둥근 루프 손잡이와 소서 가장자리의 작은 올리브 비드가 조용한 포인트를 더합니다.", position: "center", image: "/olive-bead-teacup.png", options: ["Cup + Saucer"], badge: "New" },
  { id: "silver-pastry-tongs", name: "쉘 실버 페이스트리 집게", price: 39000, category: "Cutlery", material: "Silver", description: "작은 조개 형태의 집게 끝과 절제된 힌지 장식으로 페이스트리를 편안하게 옮깁니다.", position: "center", image: "/silver-pastry-tongs.png" },
  { id: "stone-cake-stand", name: "플루티드 스톤 케이크 스탠드", price: 118000, category: "Serving Objects", material: "Stone", description: "따뜻한 베이지 스톤과 건축적인 플루티드 풋, 얇은 실버 림을 조합한 낮은 케이크 스탠드입니다.", position: "center", image: "/stone-cake-stand.png", badge: "New" },
  { id: "ribbed-butter-dish", name: "리브드 글라스 버터 디시", price: 76000, category: "Serving Objects", material: "Glass", description: "세로 결이 있는 투명 유리 커버와 작은 올리브 노브, 실버 트레이로 구성한 버터 디시입니다.", position: "center", image: "/ribbed-butter-dish.png", options: ["Dish + Lid + Tray"] },
  { id: "flax-corner-placemat", name: "보태니컬 코너 플랙스 매트", price: 32000, category: "Linen", material: "Linen", description: "내추럴 플랙스 원단에 헴스티치와 작은 버건디 식물 자수를 한쪽 모서리에만 더했습니다.", position: "center", image: "/flax-corner-placemat.png", options: ["1P", "2P"] },
  { id: "ivory-oval-platter", name: "리플 오벌 서빙 플래터", price: 68000, category: "Serving Objects", material: "Ceramic", description: "긴 타원형 비례와 잔잔한 리플, 끝부분의 작은 블루 붓자국이 특징인 서빙 플래터입니다.", position: "center", image: "/ivory-oval-platter.png" },
  { id: "ivory-ribbon-gift-box", name: "리본 테이블웨어 기프트 박스", price: 18000, category: "Gift & Wrap", material: "Paper", description: "접시나 컵 세트를 안정적으로 담을 수 있는 조절형 칸막이와 코튼 패드를 갖춘 아이보리 선물 상자입니다.", position: "center", image: "/ivory-ribbon-gift-box.png", options: ["Small", "Medium"], badge: "New" },
  { id: "arched-cake-carrier", name: "아치 윈도 케이크 캐리어", price: 12000, category: "Gift & Wrap", material: "Paper", description: "아치형 투명 창과 버건디 코튼 손잡이, 분리형 케이크 보드로 구성한 단단한 포장 상자입니다.", position: "center", image: "/arched-cake-carrier.png", options: ["Small", "Medium"] },
  { id: "botanical-linen-pouch", name: "보태니컬 플랙스 기프트 파우치", price: 15000, category: "Gift & Wrap", material: "Linen", description: "커틀러리나 작은 컵을 담아 다시 사용할 수 있는 플랙스 파우치로, 한쪽에 작은 식물 자수를 더했습니다.", position: "center", image: "/botanical-linen-pouch.png", options: ["Cutlery", "Cup"] },
  { id: "twist-cake-candle-set", name: "슬림 트위스트 케이크 캔들 8P", price: 16000, category: "Gift & Wrap", material: "Wax", description: "아이보리를 중심으로 버건디와 올리브를 한 점씩 섞은 가는 트위스트 케이크 초 여덟 개 구성입니다.", position: "center", image: "/twist-cake-candle-set.png", options: ["8P Set"], badge: "New" },
  { id: "fluted-cake-candle-set", name: "플루티드 오브제 케이크 캔들 5P", price: 22000, category: "Gift & Wrap", material: "Wax", description: "고전 기둥의 세로 결을 작은 오브제로 옮긴 케이크 초 다섯 개 구성으로 높이와 색이 조금씩 다릅니다.", position: "center", image: "/fluted-cake-candle-set.png", options: ["5P Set"] },
  { id: "scallop-small-bowl", name: "스캘럽 스몰 볼", price: 24000, category: "Plates & Bowls", material: "Ceramic", description: "아이스크림과 작은 디저트, 곁들임을 담기 좋은 작은 볼입니다.", position: "38% 49%" },
  { id: "ivory-tea-cup", name: "아이보리 티 컵", price: 31000, category: "Cups & Glasses", material: "Ceramic", description: "손에 편안히 잡히는 둥근 손잡이와 얇지 않은 두께의 티 컵입니다.", position: "82% 48%" },
  { id: "ribbed-dessert-glass", name: "클리어 리브드 젤리 글라스", price: 36000, category: "Cups & Glasses", material: "Glass", description: "젤리와 과일, 작은 디저트를 담기 좋은 도톰한 결의 글라스입니다.", position: "64% 44%", secondary: "/amber-coupe.png" },
  { id: "dessert-fork-set", name: "실버 디저트 포크 2P", price: 26000, category: "Cutlery", material: "Silver", description: "케이크와 과일을 위한 가벼운 크기의 디저트 포크 두 개 구성입니다.", position: "66% 82%", options: ["2P Set"] },
  { id: "tea-spoon-set", name: "실버 티스푼 2P", price: 24000, category: "Cutlery", material: "Silver", description: "찻잔과 작은 디저트 볼에 어울리는 티스푼 두 개 구성입니다.", position: "77% 82%", options: ["2P Set"] },
  { id: "oval-silver-tray", name: "오벌 실버 트레이", price: 89000, category: "Serving Objects", material: "Silver", description: "컵과 작은 접시를 함께 옮기거나 오브제를 놓기 좋은 타원형 트레이입니다.", position: "83% 18%" },
  { id: "flax-linen-napkin", name: "버건디 보태니컬 리넨", price: 26000, category: "Linen", material: "Linen", description: "아이보리 테두리와 큰 식물 자수가 한 폭의 오브제처럼 놓이는 리넨 냅킨입니다.", position: "center", image: "/burgundy-linen.png", options: ["1P", "2P"], badge: "New" },
  { id: "hemstitch-table-mat", name: "버건디 콘트라스트 테이블 매트", price: 34000, category: "Linen", material: "Linen", description: "깊은 버건디 컬러에 밝은 테두리를 더한 테이블 매트입니다.", position: "center", image: "/burgundy-linen.png", options: ["1P", "2P"] },
  { id: "border-dessert-plate", name: "보더 디저트 접시", price: 32000, category: "Plates & Bowls", material: "Ceramic", description: "잔잔하게 장식된 테두리가 비어 있는 순간에도 아름다운 디저트 접시입니다.", position: "20% 58%", soldOut: true, badge: "Sold out" },
];

const categories = ["All", "Plates & Bowls", "Cups & Glasses", "Cutlery", "Serving Objects", "Linen", "Gift & Wrap"];
const materials = ["All", "Silver", "Ceramic", "Glass", "Stone", "Linen", "Paper", "Wax"];
const featuredMaterials = ["Silver", "Ceramic", "Glass", "Stone", "Linen"];
const krw = (value: number) => `${value.toLocaleString("ko-KR")}원`;

function routeFromPath(): Route {
  if (typeof window === "undefined") return { page: "home" };
  const path = window.location.pathname;
  if (path.startsWith("/product/")) return { page: "product", productId: decodeURIComponent(path.split("/")[2] || "") };
  if (path === "/shop") return { page: "shop" };
  if (path === "/about") return { page: "about" };
  return { page: "home" };
}

export default function Storefront() {
  const [route, setRoute] = useState<Route>({ page: "home" });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [material, setMaterial] = useState("All");
  const [price, setPrice] = useState("All");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    setRoute(routeFromPath());
    const saved = window.localStorage.getItem("of-table-cart");
    if (saved) { try { setCart(JSON.parse(saved)); } catch { window.localStorage.removeItem("of-table-cart"); } }
    setHydrated(true);
    const onPop = () => setRoute(routeFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => { if (hydrated) window.localStorage.setItem("of-table-cart", JSON.stringify(cart)); }, [cart, hydrated]);
  useEffect(() => {
    const context = (document as WebMcpDocument).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: WebMcpTool) => Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined);
    void register({
      name: "search_products", title: "OF TABLE 상품 검색", description: "상품명, 카테고리, 소재에서 일치하는 OF TABLE 상품을 찾습니다.",
      inputSchema: { type: "object", properties: { query: { type: "string", minLength: 1 } }, required: ["query"], additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input) {
        const value = input as { query?: unknown };
        if (typeof value?.query !== "string" || !value.query.trim()) throw new Error("query must be a non-empty string");
        const term = value.query.trim().toLowerCase();
        return { products: products.filter(p => `${p.name} ${p.category} ${p.material}`.toLowerCase().includes(term)).map(p => ({ id: p.id, name: p.name, price: p.price, soldOut: !!p.soldOut })) };
      },
    });
    void register({
      name: "add_product_to_cart", title: "OF TABLE 장바구니 담기", description: "상품 ID와 수량을 확인해 같은 장바구니 상태에 상품을 추가합니다.",
      inputSchema: { type: "object", properties: { productId: { type: "string" }, quantity: { type: "integer", minimum: 1, maximum: 20 }, option: { type: "string" } }, required: ["productId"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const value = input as { productId?: unknown; quantity?: unknown; option?: unknown };
        if (typeof value?.productId !== "string") throw new Error("productId must be a string");
        const product = products.find(p => p.id === value.productId);
        if (!product) throw new Error("product not found");
        if (product.soldOut) throw new Error("product is sold out");
        const quantity = value.quantity === undefined ? 1 : value.quantity;
        if (!Number.isInteger(quantity) || typeof quantity !== "number" || quantity < 1 || quantity > 20) throw new Error("quantity must be an integer from 1 to 20");
        const option = typeof value.option === "string" ? value.option : (product.options?.[0] || "기본");
        if (product.options && !product.options.includes(option)) throw new Error("invalid option");
        setCart(current => {
          const found = current.find(i => i.id === product.id && i.option === option);
          return found ? current.map(i => i === found ? { ...i, qty: i.qty + quantity } : i) : [...current, { id: product.id, option, qty: quantity }];
        });
        toast.success(`${product.name}을 장바구니에 담았습니다.`);
        return { added: true, productId: product.id, quantity, option };
      },
    });
    return () => lifecycle.abort();
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setRoute(routeFromPath());
    setCartOpen(false); setMenuOpen(false); setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addToCart = (product: Product, option = product.options?.[0] || "기본", qty = 1) => {
    if (product.soldOut) return;
    setCart(current => {
      const found = current.find(i => i.id === product.id && i.option === option);
      return found
        ? current.map(i => i === found ? { ...i, qty: i.qty + qty } : i)
        : [...current, { id: product.id, option, qty }];
    });
    toast.success(`${product.name}을 장바구니에 담았습니다.`);
  };
  const updateQty = (id: string, option: string, qty: number) => setCart(items => qty < 1 ? items.filter(i => !(i.id === id && i.option === option)) : items.map(i => i.id === id && i.option === option ? { ...i, qty } : i));
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (products.find(p => p.id === item.id)?.price || 0) * item.qty, 0);

  const submitSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/shop");
  };

  const cartPanel = (
    <div className="cart-panel-body">
      {cart.length === 0 ? (
        <div className="empty-cart"><ShoppingBag /><h3>장바구니가 비어 있습니다.</h3><p>테이블에 오래 남을 물건을 천천히 둘러보세요.</p><button className="text-link" onClick={() => navigate("/shop")}>쇼핑 계속하기 <ArrowRight /></button></div>
      ) : <>
        <div className="cart-items">
          {cart.map(item => {
            const product = products.find(p => p.id === item.id)!;
            return <article className="cart-item" key={`${item.id}-${item.option}`}>
              <ProductImage product={product} />
              <div><h3>{product.name}</h3><p>{item.option}</p><p>{krw(product.price)}</p><div className="cart-line-actions"><Quantity value={item.qty} onChange={qty => updateQty(item.id, item.option, qty)} /><button className="remove-button" aria-label={`${product.name} 삭제`} onClick={() => updateQty(item.id, item.option, 0)}><Trash2 /></button></div></div>
            </article>;
          })}
        </div>
        <div className="cart-summary"><div><span>상품 금액</span><strong>{krw(cartTotal)}</strong></div><p>배송비와 최종 결제 금액은 결제 플랫폼 연동 후 안내됩니다.</p><button className="burgundy-button" onClick={() => toast.info("이 데모에서는 실제 주문이나 결제가 진행되지 않습니다.")}>결제 기능 준비 중</button></div>
      </>}
    </div>
  );

  return <>
    <Header cartCount={cartCount} onNavigate={navigate} onCart={() => setCartOpen(true)} menuOpen={menuOpen} setMenuOpen={setMenuOpen} searchOpen={searchOpen} setSearchOpen={setSearchOpen} query={query} setQuery={setQuery} submitSearch={submitSearch} />
    {route.page === "home" && <Home onNavigate={navigate} addToCart={addToCart} setCategory={setCategory} setMaterial={setMaterial} />}
    {route.page === "shop" && <Shop onNavigate={navigate} addToCart={addToCart} query={query} setQuery={setQuery} category={category} setCategory={setCategory} material={material} setMaterial={setMaterial} price={price} setPrice={setPrice} sort={sort} setSort={setSort} />}
    {route.page === "product" && <ProductDetail product={products.find(p => p.id === route.productId) || products[0]} addToCart={addToCart} onNavigate={navigate} />}
    {route.page === "about" && <About />}
    <Footer onNavigate={navigate} />
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="cart-sheet" side="right"><SheetHeader><SheetTitle>Cart <span>{cartCount}</span></SheetTitle><SheetDescription>선택한 상품과 수량을 확인하세요.</SheetDescription></SheetHeader>{cartPanel}</SheetContent>
    </Sheet>
    <Toaster position="bottom-center" richColors />
  </>;
}

function Header({ cartCount, onNavigate, onCart, menuOpen, setMenuOpen, searchOpen, setSearchOpen, query, setQuery, submitSearch }: {
  cartCount: number; onNavigate: (p: string) => void; onCart: () => void; menuOpen: boolean; setMenuOpen: (v: boolean) => void;
  searchOpen: boolean; setSearchOpen: (v: boolean) => void; query: string; setQuery: (v: string) => void; submitSearch: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const journal = () => { onNavigate("/"); setTimeout(() => document.getElementById("journal")?.scrollIntoView({ behavior: "smooth" }), 40); };
  return <>
    <header className="site-header">
      <button className="icon-button mobile-only" aria-label="메뉴 열기" onClick={() => setMenuOpen(true)}><Menu /></button>
      <button className="brand" onClick={() => onNavigate("/")}>OF TABLE</button>
      <nav aria-label="주요 메뉴"><button onClick={() => onNavigate("/shop")}>Shop</button><button onClick={() => onNavigate("/shop")}>Collections</button><button onClick={journal}>Journal</button><button onClick={() => onNavigate("/about")}>About</button></nav>
      <div className="header-actions"><button className="icon-button desktop-search" aria-label="검색 열기" aria-expanded={searchOpen} onClick={() => setSearchOpen(!searchOpen)}><Search /></button><button className="icon-button bag-button" aria-label={`장바구니 상품 ${cartCount}개`} onClick={onCart}><ShoppingBag /><span>{cartCount}</span></button></div>
      {searchOpen && <form className="header-search" onSubmit={submitSearch}><Search /><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="접시, 유리, 실버웨어 검색" aria-label="상품 검색" /><button type="button" aria-label="검색 닫기" onClick={() => setSearchOpen(false)}><X /></button></form>}
    </header>
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}><SheetContent side="left" className="menu-sheet"><SheetHeader><SheetTitle>OF TABLE</SheetTitle><SheetDescription>메뉴</SheetDescription></SheetHeader><nav><button onClick={() => onNavigate("/shop")}>Shop</button><button onClick={() => onNavigate("/shop")}>Collections</button><button onClick={journal}>Journal</button><button onClick={() => onNavigate("/about")}>About</button></nav><form onSubmit={submitSearch}><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="상품 검색" /><button type="submit">검색</button></form></SheetContent></Sheet>
  </>;
}

function Home({ onNavigate, addToCart, setCategory, setMaterial }: { onNavigate: (p: string) => void; addToCart: (p: Product) => void; setCategory: (v: string) => void; setMaterial: (v: string) => void }) {
  const shopMaterial = (value: string) => { setMaterial(value); setCategory("All"); onNavigate("/shop"); };
  const shopCategory = (value: string) => { setCategory(value); setMaterial("All"); onNavigate("/shop"); };
  return <main>
    <section className="hero">
      <img src="/hero-table-v2.png" alt="아이보리 보태니컬 접시에 담은 무화과 헤이즐넛 타르트와 실버 케이크 서버" />
      <div className="hero-copy"><p className="eyebrow">OBJECTS FOR THE TABLE</p><h1>오래 곁에 두고<br />싶은 것들.</h1><p>디저트를 담는 접시부터 티타임의 작은 도구까지.<br />매일의 테이블을 위한 물건을 고릅니다.</p><button className="primary-action" onClick={() => onNavigate("/shop")}>컬렉션 둘러보기 <ArrowUpRight /></button></div>
      <p className="hero-index">A QUIET TABLE<br />CURATED OBJECTS</p>
    </section>

    <section className="section selected-section"><SectionHead eyebrow="01 — SELECTED OBJECTS" title="에디터의 선택" action="모두 보기" onAction={() => onNavigate("/shop")} /><div className="product-grid selected-grid">{products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} addToCart={addToCart} />)}</div></section>

    <section className="dessert-editorial">
      <div className="dessert-editorial-head"><p className="eyebrow dark">SERVED &amp; SHARED</p><h2>그릇이 가장 아름다운 순간.</h2><p>비어 있는 형태와 디저트를 담았을 때의 표정을 함께 봅니다.</p></div>
      <div className="dessert-editorial-grid">
        <figure><img src="/served-neutral-berry-tart.png" alt="아이보리 접시에 담은 베리 타르트" /><figcaption><span>01</span><p>Berry tart<br /><small>Ivory botanical plate</small></p></figcaption></figure>
        <figure><img src="/served-neutral-jelly.png" alt="투명한 쿠페에 담은 시트러스 젤리" /><figcaption><span>02</span><p>Citrus jelly<br /><small>Honey-foot glass coupe</small></p></figcaption></figure>
        <figure><img src="/served-neutral-pastry.png" alt="아이보리 컵과 마들렌, 피스타치오 휘낭시에" /><figcaption><span>03</span><p>Coffee &amp; pastry<br /><small>Blue-line faceted cup</small></p></figcaption></figure>
      </div>
    </section>

    <section className="sunday-section">
      <div className="sunday-image"><img src="/served-neutral-cake-dome.png" alt="투명한 유리 돔과 라즈베리 초콜릿 케이크" /><span>THE SUNDAY TABLE · 01</span></div>
      <div className="sunday-copy"><p className="eyebrow dark">MONTHLY TABLE</p><h2>늦은 오후,<br />케이크 한 조각.</h2><p>빛을 머금은 유리와 부드러운 도자기로 차린 작은 테이블. 나란히 두었을 때 더 좋아지는 세 가지 물건을 골랐습니다.</p><button className="line-button" onClick={() => onNavigate("/shop")}>이 테이블의 제품 보기 <ArrowRight /></button><div className="table-products">{products.slice(1,4).map((p, i) => <button onClick={() => onNavigate(`/product/${p.id}`)} key={p.id}><span>0{i + 1}</span><span>{p.name}</span><strong>{krw(p.price)}</strong></button>)}</div></div>
    </section>

    <section className="gift-wrap-section">
      <div className="gift-wrap-copy"><p className="eyebrow dark">GIFT &amp; CELEBRATION</p><h2>건네는 순간까지<br />하나의 장면으로.</h2><p>테이블웨어를 위한 선물 상자와 케이크를 완성하는 작은 초를 함께 골랐습니다.</p><button className="line-button" onClick={() => shopCategory("Gift & Wrap")}>Gift &amp; Wrap 보기 <ArrowRight /></button></div>
      <button className="gift-wrap-image gift-box-image" onClick={() => onNavigate("/product/ivory-ribbon-gift-box")}><img src="/ivory-ribbon-gift-box.png" alt="리본 테이블웨어 기프트 박스" /><span>Gift box</span></button>
      <button className="gift-wrap-image gift-candle-image" onClick={() => onNavigate("/product/twist-cake-candle-set")}><img src="/twist-cake-candle-set.png" alt="슬림 트위스트 케이크 캔들 세트" /><span>Cake candles</span></button>
    </section>

    <section className="section materials"><SectionHead eyebrow="02 — BY MATERIAL" title="소재로 발견하기" /><div className="material-grid">{featuredMaterials.map((m, i) => <button key={m} onClick={() => shopMaterial(m)}><img src={["/twist-cake-server.png", "/neutral-botanical-plate.png", "/neutral-glass-dome.png", "/stone-cake-stand.png", "/flax-corner-placemat.png"][i]} alt={`${m} 소재 테이블웨어`} /><span>{m}</span><ArrowUpRight /></button>)}</div></section>

    <section className="object-story">
      <div className="story-copy"><p className="eyebrow dark">03 — OBJECT STORY</p><span className="story-number">No. 01</span><h2>선 하나로<br />분위기를 바꾸는 도구.</h2><p>꼬임이 있는 스템과 절제된 투각이 케이크를 나누는 짧은 순간에도 선명한 장면을 만듭니다.</p><button className="line-button" onClick={() => onNavigate("/product/silver-cake-server")}>제품 자세히 보기 <ArrowRight /></button></div>
      <div className="story-image"><img src="/twist-cake-server.png" alt="트위스트 스템 실버 케이크 서버" /></div>
    </section>

    <section className="section journal" id="journal"><SectionHead eyebrow="04 — NOTES ON THE TABLE" title="테이블에 관한 메모" /><div className="journal-grid">{[
      ["01", "디저트 접시를 고를 때 살펴볼 세 가지", "크기와 림, 유약의 표정을 기준으로 오래 쓸 접시를 고르는 방법."],
      ["02", "작은 테이블을 위한 티타임 구성", "많이 놓지 않아도 충분한, 컵과 접시와 작은 도구의 균형."],
      ["03", "소재별 테이블웨어 관리법", "도자기와 유리, 실버웨어를 편안하게 오래 쓰기 위한 기본."],
    ].map(item => <article key={item[0]}><span>{item[0]} / NOTE</span><h3>{item[1]}</h3><p>{item[2]}</p><span className="preparing">글 준비 중</span></article>)}</div></section>
  </main>;
}

function Shop({ onNavigate, addToCart, query, setQuery, category, setCategory, material, setMaterial, price, setPrice, sort, setSort }: {
  onNavigate: (p: string) => void; addToCart: (p: Product) => void; query: string; setQuery: (v: string) => void;
  category: string; setCategory: (v: string) => void; material: string; setMaterial: (v: string) => void; price: string; setPrice: (v: string) => void; sort: string; setSort: (v: string) => void;
}) {
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const result = products.filter(p => (!term || `${p.name} ${p.category} ${p.material}`.toLowerCase().includes(term)) && (category === "All" || p.category === category) && (material === "All" || p.material === material) && (price === "All" || (price === "under3" && p.price < 30000) || (price === "3to6" && p.price >= 30000 && p.price <= 60000) || (price === "over6" && p.price > 60000)));
    return [...result].sort((a,b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : sort === "name" ? a.name.localeCompare(b.name, "ko") : products.indexOf(a) - products.indexOf(b));
  }, [query, category, material, price, sort]);
  const clear = () => { setQuery(""); setCategory("All"); setMaterial("All"); setPrice("All"); };
  const active = [category !== "All" && category, material !== "All" && material, price !== "All" && ({under3:"3만원 미만", "3to6":"3–6만원", over6:"6만원 이상"} as Record<string,string>)[price]].filter(Boolean);
  return <main className="shop-page">
    <section className="page-intro"><p className="eyebrow dark">SHOP ALL OBJECTS</p><h1>Objects for<br />every table.</h1><p>매일 손이 가는 작은 그릇부터 테이블의 장면을 완성하는 오브제까지.</p></section>
    <section className="shop-controls">
      <div className="shop-search"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="상품명 또는 소재 검색" aria-label="상품 검색" />{query && <button onClick={() => setQuery("")} aria-label="검색어 지우기"><X /></button>}</div>
      <div className="filter-groups"><FilterGroup label="Category" values={categories} value={category} onChange={setCategory} /><FilterGroup label="Material" values={materials} value={material} onChange={setMaterial} /><FilterGroup label="Price" values={["All","under3","3to6","over6"]} labels={["전체","3만원 미만","3–6만원","6만원 이상"]} value={price} onChange={setPrice} /></div>
      <div className="results-bar"><div><strong>{filtered.length}</strong> objects {active.length > 0 && <span>· {active.join(" · ")}</span>}</div><Select value={sort} onValueChange={setSort}><SelectTrigger className="sort-trigger" aria-label="상품 정렬"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="featured">추천순</SelectItem><SelectItem value="low">낮은 가격순</SelectItem><SelectItem value="high">높은 가격순</SelectItem><SelectItem value="name">이름순</SelectItem></SelectContent></Select></div>
    </section>
    {filtered.length ? <section className="product-grid shop-grid">{filtered.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} addToCart={addToCart} />)}</section> : <section className="empty-results"><span>0 objects</span><h2>찾으시는 물건이 없습니다.</h2><p>검색어나 적용한 필터를 바꾸어 다시 살펴보세요.</p><button className="burgundy-button" onClick={clear}>필터 초기화</button></section>}
  </main>;
}

function ProductDetail({ product, addToCart, onNavigate }: { product: Product; addToCart: (p: Product, o?: string, q?: number) => void; onNavigate: (p: string) => void }) {
  const [option, setOption] = useState(product.options?.[0] || "기본");
  const [qty, setQty] = useState(1);
  useEffect(() => { setOption(product.options?.[0] || "기본"); setQty(1); }, [product.id]);
  return <main className="product-page">
    <div className="breadcrumb"><button onClick={() => onNavigate("/shop")}>Shop</button><ChevronRight /><span>{product.category}</span></div>
    <section className="product-hero">
      <div className="product-gallery"><div className="detail-image"><ProductImage product={product} /></div><div className="detail-image secondary-detail"><img src={product.secondary || (product.id === "silver-cake-server" ? "/hero-table-v2.png" : "/collection-flatlay.png")} alt={`${product.name} 사용 장면`} /></div></div>
      <div className="purchase-panel"><p className="product-meta">{product.material} · {product.category}</p><h1>{product.name}</h1><p className="detail-price">{krw(product.price)}</p><p className="detail-description">{product.description}</p>{product.options && <label className="option-label">구성<Select value={option} onValueChange={setOption}><SelectTrigger className="option-trigger"><SelectValue /></SelectTrigger><SelectContent>{product.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></label>}<div className="qty-row"><span>수량</span><Quantity value={qty} onChange={setQty} /></div><button disabled={product.soldOut} className="burgundy-button add-main" onClick={() => addToCart(product, option, qty)}>{product.soldOut ? "품절" : "장바구니에 담기"}</button><dl className="quick-info"><div><dt>구성</dt><dd>{option === "기본" ? "단품 1개" : option}</dd></div><div><dt>소재</dt><dd>{product.material}</dd></div><div><dt>안내</dt><dd>샘플 상품 · 상세 정보 교체 예정</dd></div></dl></div>
    </section>
    <section className="detail-sections"><article><span>01</span><h2>형태와 쓰임</h2><p>{product.description} 사진은 데모를 위한 연출 이미지이며, 실제 판매 시 확인된 크기와 제작 정보를 이곳에 안내합니다.</p></article><article><span>02</span><h2>관리 방법</h2><p>소재별 세척과 보관 방법은 실제 제품 사양 확인 후 제공됩니다. 확인되지 않은 관리법은 표시하지 않습니다.</p></article><article><span>03</span><h2>배송과 교환</h2><p>배송비, 출고 일정, 교환 조건은 운영 플랫폼과 정책이 확정된 후 안내됩니다.</p></article></section>
    <section className="mobile-buy"><div><span>{product.name}</span><strong>{krw(product.price)}</strong></div><button disabled={product.soldOut} onClick={() => addToCart(product, option, qty)}>{product.soldOut ? "품절" : "담기"}</button></section>
  </main>;
}

function About() {
  return <main className="about-page"><section className="about-hero"><p className="eyebrow dark">ABOUT OF TABLE</p><h1>좋은 물건은<br />시간과 함께<br />테이블에 남습니다.</h1></section><section className="about-grid"><div><img src="/collection-flatlay.png" alt="OF TABLE이 고른 테이블웨어" /></div><article><span>OUR POINT OF VIEW</span><h2>한 점씩, 오래 보고 고릅니다.</h2><p>OF TABLE은 빈티지의 따뜻한 표정과 오늘의 생활에 맞는 쓰임을 함께 봅니다. 매일 손이 가는 비례, 다른 물건과 자연스럽게 어울리는 색, 오래 두어도 질리지 않는 형태를 기준으로 고릅니다.</p><p>이곳의 상품은 빈티지 스타일의 새 제품을 중심으로 소개합니다. 실제 빈티지 제품을 다룰 때에는 제작 시기와 상태, 사용 흔적을 구분해 안내합니다.</p></article></section><blockquote>“시간이 흐를수록 더 좋아지는,<br />테이블 위의 물건들.”</blockquote><section className="about-note"><h2>공간에 대하여</h2><p>크림색 벽과 짙은 월넛 선반, 돌 테이블이 있는 조용한 편집숍의 감각을 상상해 만든 온라인 공간입니다. 한남동 매장은 브랜드의 가상 설정이며 실제 운영 매장이 아닙니다.</p></section></main>;
}

function ProductCard({ product, onNavigate, addToCart }: { product: Product; onNavigate: (p: string) => void; addToCart: (p: Product) => void }) {
  return <article className={`product-card ${product.soldOut ? "sold-out" : ""}`}><button className="product-media" onClick={() => onNavigate(`/product/${product.id}`)} aria-label={`${product.name} 자세히 보기`}><ProductImage product={product} hover />{product.badge && <span className="product-badge">{product.badge}</span>}</button><div className="product-info"><button onClick={() => onNavigate(`/product/${product.id}`)}><span>{product.name}</span><strong>{krw(product.price)}</strong></button><button className="quick-add" disabled={product.soldOut} onClick={() => addToCart(product)} aria-label={`${product.name} 장바구니에 담기`}>{product.soldOut ? "품절" : <Plus />}</button></div></article>;
}

function ProductImage({ product, hover = false }: { product: Product; hover?: boolean }) {
  const image = product.image || "/collection-flatlay.png";
  return <div className="product-image"><img className="primary-img" src={image} alt={product.name} style={{ objectPosition: product.image ? "center" : product.position }} />{hover && product.secondary && <img className="secondary-img" src={product.secondary} alt={`${product.name} 사용 장면`} />}</div>;
}

function Quantity({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return <div className="quantity"><button onClick={() => onChange(value - 1)} aria-label="수량 줄이기"><Minus /></button><span aria-live="polite">{value}</span><button onClick={() => onChange(value + 1)} aria-label="수량 늘리기"><Plus /></button></div>;
}

function FilterGroup({ label, values, labels, value, onChange }: { label: string; values: string[]; labels?: string[]; value: string; onChange: (v: string) => void }) {
  return <fieldset><legend>{label}</legend><div>{values.map((item, i) => <button type="button" aria-pressed={value === item} className={value === item ? "active" : ""} onClick={() => onChange(item)} key={item}>{labels?.[i] || (item === "All" ? "전체" : item)}</button>)}</div></fieldset>;
}

function SectionHead({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="section-head"><div><p>{eyebrow}</p><h2>{title}</h2></div>{action && <button onClick={onAction}>{action} <ArrowUpRight /></button>}</div>;
}

function Footer({ onNavigate }: { onNavigate: (p: string) => void }) {
  const pending = () => toast.info("운영 정보 확정 후 제공될 페이지입니다.");
  return <footer><div className="footer-brand"><button onClick={() => onNavigate("/")}>OF TABLE</button><p>시간이 흐를수록 더 좋아지는,<br />테이블 위의 물건들.</p></div><div className="footer-links"><div><span>Shop</span><button onClick={() => onNavigate("/shop")}>All Objects</button><button onClick={() => onNavigate("/shop")}>Collections</button><button onClick={() => onNavigate("/about")}>About</button></div><div><span>Help</span><button onClick={pending}>고객 문의</button><button onClick={pending}>배송 · 교환 안내</button><button onClick={pending}>이용약관</button><button onClick={pending}>개인정보처리방침</button></div></div><div className="footer-legal"><span>© OF TABLE — DEMO</span><p>사업자 정보와 연락처는 실제 정보가 제공된 후 입력됩니다.</p></div></footer>;
}
