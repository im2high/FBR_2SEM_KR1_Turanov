const express = require("express");
const cors = require("cors");
const { nanoid } = require('nanoid');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Middleware для логирования запросов
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}][${req.method}] ${res.statusCode} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      console.log('Body:', req.body);
    }
  });
  next();
});

// Разрешаем запросы с фронта
app.use(
  cors({
    origin: "http://localhost:3001",
  })
);

// Хранилище товаров в памяти
let products = [
  { 
    id: nanoid(6), 
    title: "Razer Boomslang 20th Anniversary Edition", 
    category: "Мышки", 
    description: "Самая дорогая мышь", 
    price: 150000, 
    stock: 1 
  },
  { 
    id: nanoid(6), 
    title: "Умный глазок Ezviz DP2C",
    category: "Дверные глазки",
    description: "Умный дверной глазок",
    price: 13000,
    stock: 325
  },
  { 
    id: nanoid(6), 
    title: "МФУ лазерное Pantum",
    category: "Лазерные МФУ",
    description: "Самый дорогой принтер",
    price: 1800000,
    stock: 15
  }
];

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API управления товарами',
      version: '1.0.0',
      description: 'Простое API для управления товарами интернет-магазина',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Локальный сервер',
      },
    ],
  },
  apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           description: Автоматически сгенерированный уникальный ID товара
 *         title:
 *           type: string
 *           description: Название товара
 *         category:
 *           type: string
 *           description: Категория товара
 *         description:
 *           type: string
 *           description: Описание товара
 *         price:
 *           type: integer
 *           description: Цена товара в рублях
 *         stock:
 *           type: integer
 *           description: Количество товара на складе
 *       example:
 *         id: "abc123"
 *         title: "Razer Boomslang 20th Anniversary Edition"
 *         category: "Мышки"
 *         description: "Самая дорогая мышь"
 *         price: 150000
 *         stock: 1
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создает новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *               - price
 *               - stock
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: integer
 *               stock:
 *                 type: integer
 *             example:
 *               title: "Razer Viper Ultimate"
 *               category: "Мышки"
 *               description: "Беспроводная игровая мышь"
 *               price: 12990
 *               stock: 2
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Неверные данные
 */
app.post("/api/products", (req, res) => {
  const { title, category, description, price, stock } = req.body;
  
  if (!title?.trim() || !category?.trim() || !description?.trim() || !price || !stock) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: "Price must be a positive number" });
  }
  
  if (typeof stock !== 'number' || stock < 0) {
    return res.status(400).json({ error: "Stock must be a non-negative number" });
  }
  
  const newProduct = {
    id: nanoid(6),
    title: title.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price),
    stock: Number(stock),
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Возвращает список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get("/api/products", (req, res) => {
  res.json(products);
});

// Вспомогательная функция для поиска товара
function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return null;
  }
  return product;
}

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получает товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.get("/api/products/:id", (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Частично обновляет товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: integer
 *               stock:
 *                 type: integer
 *             example:
 *               title: "Razer Viper Ultimate (Updated)"
 *               price: 11990
 *     responses:
 *       200:
 *         description: Обновленный товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Нечего обновлять или неверные данные
 *       404:
 *         description: Товар не найден
 */
app.patch("/api/products/:id", (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  
  if (req.body?.title === undefined && 
      req.body?.category === undefined && 
      req.body?.description === undefined && 
      req.body?.price === undefined && 
      req.body?.stock === undefined) {
    return res.status(400).json({ error: "Nothing to update" });
  }
  
  const { title, category, description, price, stock } = req.body;
  
  if (title !== undefined) {
    if (!title.trim()) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }
    product.title = title.trim();
  }
  
  if (category !== undefined) {
    if (!category.trim()) {
      return res.status(400).json({ error: "Category cannot be empty" });
    }
    product.category = category.trim();
  }
  
  if (description !== undefined) {
    if (!description.trim()) {
      return res.status(400).json({ error: "Description cannot be empty" });
    }
    product.description = description.trim();
  }
  
  if (price !== undefined) {
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: "Price must be a positive number" });
    }
    product.price = Number(price);
  }
  
  if (stock !== undefined) {
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: "Stock must be a non-negative number" });
    }
    product.stock = Number(stock);
  }
  
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удаляет товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар успешно удален (нет тела ответа)
 *       404:
 *         description: Товар не найден
 */
app.delete("/api/products/:id", (req, res) => {
  const id = req.params.id;
  const exists = products.some(p => p.id === id);
  
  if (!exists) {
    return res.status(404).json({ error: "Product not found" });
  }
  
  products = products.filter(p => p.id !== id);
  res.status(204).send();
});

// Healthcheck / главная
app.get("/", (req, res) => {
  res.send("Products API is running. Try /api/products or /api-docs for Swagger documentation");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
  console.log(`Swagger documentation: http://localhost:${PORT}/api-docs`);
});