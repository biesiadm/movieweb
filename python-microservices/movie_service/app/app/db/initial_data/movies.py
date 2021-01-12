from app import crud, schemas

movies = [
    schemas.MovieCreate(
        title='Pulp Fiction',
        director='Quentin Tarantino',
        year=1994,
        country='USA',
        category='Drama'
    ),
    schemas.MovieCreate(
        title='Kill Bill',
        director='Quentin Tarantino',
        year=2003,
        country='USA',
        category='Action'
    ),
    schemas.MovieCreate(
        title='Se7en',
        director='David Fincher',
        year=1995,
        country='USA',
        category='Crime'
    ),
    schemas.MovieCreate(
        title='The Lord of the Rings: The Fellowship of the Ring',
        director='Peter Jackson',
        year=1995,
        country='USA',
        category='Adventure'
    ),
    schemas.MovieCreate(
        title='Léon',
        director='Luc Besson',
        year=1994,
        country='France',
        category='Action'
    ),
]
