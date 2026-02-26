import { api } from "./apiClient";

/**
 * TODO (Практика 4):
 * Реализуйте функции работы с API.
 * Подсказка: используйте api.get/post/patch/delete и возвращайте data.
 */

export async function getProducts() {
    return (await api.get('/products')).data;
}

export async function createProduct(payload) {
    return (await api.post('/products', payload)).data;
}

export async function updateProduct(id, patch) {
    return (await api.patch(`/products/${id}`, patch)).data;
}

export async function deleteProduct(id) {
    return (await api.delete(`/products/${id}`)).data;
}