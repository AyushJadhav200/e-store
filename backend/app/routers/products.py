from fastapi import APIRouter, HTTPException

from app.data import SAMPLE_PRODUCTS
from app.schemas import ProductListResponse, ProductResponse

router = APIRouter(tags=["products"])


@router.get("/products", response_model=ProductListResponse)
def list_products() -> ProductListResponse:
    return ProductListResponse(products=SAMPLE_PRODUCTS)


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: str) -> ProductResponse:
    for product in SAMPLE_PRODUCTS:
        if product.id == product_id:
            return ProductResponse(product=product)

    raise HTTPException(status_code=404, detail="Product not found")
