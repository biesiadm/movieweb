import random

from app import schemas
from app.core.config import settings


users = [
    schemas.UserCreate(
        email=settings.ADMIN_EMAIL,
        name=settings.ADMIN_NAME,
        password=settings.ADMIN_PASSWORD,
        login='admin',
        avatar_url=f'https://www.gravatar.com/avatar/{random.randint(0, 100000000000)}?d=identicon&s=512&r=g',
        is_superuser=True
    ),
    schemas.UserCreate(
        email="janek.test@wp.pl",
        name="Janek",
        login='janek3',
        avatar_url=f'https://www.gravatar.com/avatar/{random.randint(0, 100000000000)}?d=identicon&s=512&r=g',
        password="password"
    ),
    schemas.UserCreate(
        email="piotrek.test@gmail.com",
        name="Piotrek",
        login='pio-tr',
        avatar_url=f'https://www.gravatar.com/avatar/{random.randint(0, 100000000000)}?d=identicon&s=512&r=g',
        password="password"
    ),
    schemas.UserCreate(
        email="kasia.test@yahoo.com",
        name="Kasia",
        login='kasiakasiakasia333',
        avatar_url=f'https://www.gravatar.com/avatar/{random.randint(0, 100000000000)}?d=identicon&s=512&r=g',
        password="password"
    ),
    schemas.UserCreate(
        email="alicja.test@o2.pl",
        name="Alicja",
        login='aliuwu',
        avatar_url=f'https://www.gravatar.com/avatar/{random.randint(0, 100000000000)}?d=identicon&s=512&r=g',
        password="password"
    )
]
