from app import crud, schemas

movies = [
    schemas.MovieCreate(
        title='Pulp Fiction',
        poster_url='https://fwcdn.pl/fpo/10/39/1039/7517880.3.jpg',
        director='Quentin Tarantino',
        year=1994,
        country='USA',
        category='Drama'
    ),
    schemas.MovieCreate(
        title='Kill Bill',
        poster_url='https://i.pinimg.com/originals/9e/69/36/9e69367fef306b6bfef9f82f3711133e.jpg',
        director='Quentin Tarantino',
        year=2003,
        country='USA',
        category='Action'
    ),
    schemas.MovieCreate(
        title='Se7en',
        poster_url='https://m.media-amazon.com/images/M/MV5BOTUwODM5MTctZjczMi00OTk4LTg3NWUtNmVhMTAzNTNjYjcyXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg',
        director='David Fincher',
        year=1995,
        country='USA',
        category='Crime'
    ),
    schemas.MovieCreate(
        title='The Lord of the Rings: The Fellowship of the Ring',
        poster_url='https://images-na.ssl-images-amazon.com/images/I/81EBp0vOZZL._AC_SL1329_.jpg',
        director='Peter Jackson',
        year=1995,
        country='USA',
        category='Adventure'
    ),
    schemas.MovieCreate(
        title='Léon',
        poster_url='https://images-na.ssl-images-amazon.com/images/I/71p0pEifHEL._AC_SY500_.jpg',
        director='Luc Besson',
        year=1994,
        country='France',
        category='Action'
    ),
]
