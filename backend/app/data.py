from app.schemas import Product

SAMPLE_PRODUCTS: list[Product] = [
    Product(
        id="1",
        name="Everyday Tote",
        description="Canvas tote for daily errands.",
        price_cents=2499,
        image_url="https://placehold.co/400x400?text=Tote",
    ),
    Product(
        id="2",
        name="Studio Headphones",
        description="Over-ear headphones with a quiet fit.",
        price_cents=12900,
        image_url="https://placehold.co/400x400?text=Headphones",
    ),
    Product(
        id="3",
        name="Ceramic Mug",
        description="12oz mug, dishwasher safe.",
        price_cents=1800,
        image_url="https://placehold.co/400x400?text=Mug",
    ),
]
