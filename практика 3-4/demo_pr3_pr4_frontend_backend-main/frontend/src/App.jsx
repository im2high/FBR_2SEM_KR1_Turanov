import { useEffect, useMemo, useState } from "react";
import { createProduct, deleteProduct, getProducts, updateProduct } from "./api/productsApi";

/**
 * Практика 4 (заготовка).
 * Важно: это НЕ готовое решение. В файле api/productsApi.js стоят TODO.
 * Цель: подключить React к вашему Express API и выполнить базовый CRUD.
 */
export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Минимальная форма добавления товара
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");

  const canSubmit = useMemo(() => title.trim() !== "" && price !== "", [title, price]);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await getProducts();
      setItems(data);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onAdd(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setError("");
    try {
      await createProduct({
        title: title.trim(),
        price: Number(price),
        category: category.trim(),
        description: description.trim(),
        stock: Number(stock),
      });
      setTitle("");
      setPrice("");
      setCategory("");
      setDescription("");
      setStock("");
      await load();
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  async function onDelete(id) {
    setError("");
    try {
      await deleteProduct(id);
      await load();
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  async function onPricePlus(id, currentPrice) {
    setError("");
    try {
      await updateProduct(id, { price: Number(currentPrice) + 10 });
      await load();
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>Практика 4 — React + Express API</h1>

      <p style={{ color: "#555" }}>
        Если видите ошибку <code>TODO: реализуйте ...</code>, значит вы ещё не реализовали функции в{" "}
        <code>src/api/productsApi.js</code>.
      </p>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Добавить товар</h2>
        <form onSubmit={onAdd} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название"
            style={{ padding: 10, minWidth: 220 }}
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Цена"
            type="number"
            style={{ padding: 10, width: 140 }}
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Категория"
            style={{ padding: 10, minWidth: 160 }}
          />
          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Количество"
            type="number"
            style={{ padding: 10, width: 120 }}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
            rows="2"
            style={{ padding: 10, width: "100%" }}
          />
          <div style={{ display: "flex", gap: 12, width: "100%" }}>
            <button disabled={!canSubmit} style={{ padding: "10px 14px" }}>
              Добавить
            </button>
            <button type="button" onClick={load} style={{ padding: "10px 14px" }}>
              Обновить список
            </button>
          </div>
        </form>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Список товаров</h2>

        {loading && <p>Загрузка...</p>}
        {error && (
          <p style={{ color: "crimson" }}>
            Ошибка: {error}
            <br />
            Проверьте, что: (1) backend запущен на 3000, (2) CORS настроен, (3) TODO в productsApi.js реализованы.
          </p>
        )}

        <ul style={{ paddingLeft: 18 }}>
          {items.map((p) => (
            <li key={p.id} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <b>{p.title}</b> — {p.price} ₽
                {p.category && <span style={{ color: "#666" }}>({p.category})</span>}
                {p.stock !== undefined && (
                  <span style={{ color: p.stock > 0 ? "green" : "red" }}>
                    {p.stock > 0 ? `📦 ${p.stock} шт` : "❌ нет"}
                  </span>
                )}
                <button onClick={() => onPricePlus(p.id, p.price)} style={{ marginLeft: 8 }}>
                  +10 ₽
                </button>
                <button onClick={() => onDelete(p.id)} style={{ marginLeft: 8 }}>
                  Удалить
                </button>
              </div>
              {p.description && (
                <p style={{ margin: "4px 0 0 20px", color: "#666", fontSize: "14px" }}>
                  {p.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}