from app import schemas

users = [
    schemas.UserCreate(
        email="janek.test@wp.pl",
        name="Janek",
        password="password"
    ),
    schemas.UserCreate(
        email="piotrek.test@gmail.com",
        name="Piotrek",
        password="password"
    ),
    schemas.UserCreate(
        email="kasia.test@yahoo.com",
        name="Kasia",
        password="password"
    ),
    schemas.UserCreate(
        email="alicja.test@o2.pl",
        name="Alicja",
        password="password"
    )
]
