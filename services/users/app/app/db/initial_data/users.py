import random
from faker import Faker

from app import schemas
from app.core.config import settings

fake = Faker()


def generate_user():
    avatar_val = random.randint(0, 100000000000)

    return schemas.UserCreate(
        email=fake.email(),
        name=fake.name(),
        password='password',
        login=fake.user_name(),
        avatar_url=f'https://www.gravatar.com/avatar/{avatar_val}?d=identicon&s=512&r=g'
    )


pre_made = [
    schemas.UserCreate(
        email=settings.ADMIN_EMAIL,
        name=settings.ADMIN_NAME,
        password=settings.ADMIN_PASSWORD,
        login=settings.ADMIN_LOGIN,
        avatar_url=f'https://www.gravatar.com/avatar/{random.randint(0, 100000000000)}?d=identicon&s=512&r=g',
        is_superuser=True
    ),
    schemas.UserCreate(
        email=settings.USER1_EMAIL,
        name=settings.USER1_NAME,
        password=settings.USER1_PASSWORD,
        login=settings.USER1_LOGIN,
        avatar_url=f'https://www.gravatar.com/avatar/{random.randint(0, 100000000000)}?d=identicon&s=512&r=g',
        is_superuser=False
    ),
    schemas.UserCreate(
        email=settings.USER2_EMAIL,
        name=settings.USER2_NAME,
        password=settings.USER2_PASSWORD,
        login=settings.USER2_LOGIN,
        avatar_url=f'https://www.gravatar.com/avatar/{random.randint(0, 100000000000)}?d=identicon&s=512&r=g',
        is_superuser=False
    )
]

users = pre_made + [generate_user() for i in range(settings.NUMBER_OF_USERS)]
