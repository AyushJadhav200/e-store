from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    service: str


class Product(BaseModel):
    id: str
    name: str
    description: str
    price_cents: int
    image_url: str


class ProductListResponse(BaseModel):
    products: list[Product]


class ProductResponse(BaseModel):
    product: Product
