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


admin = [schemas.UserCreate(
        email=settings.ADMIN_EMAIL,
        name=settings.ADMIN_NAME,
        password=settings.ADMIN_PASSWORD,
        login='admin',
        avatar_url=f'https://www.gravatar.com/avatar/{random.randint(0, 100000000000)}?d=identicon&s=512&r=g',
        is_superuser=True
    )]


users = admin + [generate_user() for i in range(settings.NUMBER_OF_USERS)]
