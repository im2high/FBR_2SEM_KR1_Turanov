const express = require('express');
const app = express();
const port = 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Начальные данные товаров
let products = [
    { id: 1, название: 'Телефон', стоимость: 5000 },
    { id: 2, название: 'Ноутбук', стоимость: 45000 },
    { id: 3, название: 'Часы', стоимость: 3000 },
];

// Главная страница
app.get('/', (req, res) => {
    res.send('Главная страница магазина');
});

// Получить все товары
app.get('/products', (req, res) => {
    res.json(products);
});

// Получить товар по id
app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Товар не найден' });
    }
    res.json(product);
});

// Добавить новый товар
app.post('/products', (req, res) => {
    const { название, стоимость } = req.body;

    if (!название || стоимость === undefined) {
        return res.status(400).json({ message: 'Не указаны название или стоимость товара' });
    }

    const newProduct = {
        id: Date.now(),
        название,
        стоимость
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.patch('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);


    const { название, стоимость } = req.body;
    if (название !== undefined) product.название = название;
    if (стоимость !== undefined) product.стоимость = стоимость;

    res.json(product);
});

app.delete('/products/:id', (req, res) => {
    const productExists = products.some(p => p.id == req.params.id);

    products = products.filter(p => p.id != req.params.id);
    res.json({ message: 'Товар удалён' });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});