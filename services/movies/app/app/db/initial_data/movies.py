from app import crud, schemas

movies = [
    schemas.MovieCreate(
        title='Pulp Fiction',
        poster_url='https://fwcdn.pl/fpo/10/39/1039/7517880.3.jpg',
        background_url='https://fwcdn.pl/fph/10/39/1039/161852.1.jpg',
        director='Quentin Tarantino',
        year=1994,
        country='USA',
        category='Drama'
    ),
    schemas.MovieCreate(
        title='Kill Bill',
        poster_url='https://i.pinimg.com/originals/9e/69/36/9e69367fef306b6bfef9f82f3711133e.jpg',
        background_url='https://fwcdn.pl/fph/32/00/33200/174751.1.jpg',
        director='Quentin Tarantino',
        year=2003,
        country='USA',
        category='Action'
    ),
    schemas.MovieCreate(
        title='Se7en',
        poster_url='https://m.media-amazon.com/images/M/MV5BOTUwODM5MTctZjczMi00OTk4LTg3NWUtNmVhMTAzNTNjYjcyXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg',
        background_url='https://fwcdn.pl/fph/07/02/702/182019.1.jpg',
        director='David Fincher',
        year=1995,
        country='USA',
        category='Crime'
    ),
    schemas.MovieCreate(
        title='The Lord of the Rings: The Fellowship of the Ring',
        poster_url='https://images-na.ssl-images-amazon.com/images/I/81EBp0vOZZL._AC_SL1329_.jpg',
        background_url='https://fwcdn.pl/fph/10/65/1065/447285.1.jpg',
        director='Peter Jackson',
        year=1995,
        country='USA',
        category='Adventure'
    ),
    schemas.MovieCreate(
        title='Léon',
        poster_url='https://images-na.ssl-images-amazon.com/images/I/71p0pEifHEL._AC_SY500_.jpg',
        background_url='https://fwcdn.pl/fph/06/71/671/401035.1.jpg',
        director='Luc Besson',
        year=1994,
        country='France',
        category='Action'
    ),
    schemas.MovieCreate(
        title='Ghost in The Shell',
        poster_url='https://fwcdn.pl/fpo/18/66/31866/7456910.3.jpg',
        background_url='https://fwcdn.pl/fph/18/66/31866/227663.1.jpg',
        director='Kōkaku Kidōtai',
        year=1995,
        country='Japan',
        category='Sci-Fi'
    ),
    schemas.MovieCreate(
        title='Heat',
        poster_url='https://fwcdn.pl/fpo/06/60/660/7756474.3.jpg',
        background_url='https://fwcdn.pl/fph/06/60/660/400967.1.jpg',
        director='Michael Mann',
        year=1995,
        country='USA',
        category='Action'
    ),
    schemas.MovieCreate(
        title='Inside Out',
        poster_url='https://fwcdn.pl/fpo/21/70/682170/7917340.3.jpg',
        background_url='https://fwcdn.pl/fph/21/70/682170/575066_1.1.jpg',
        director='Pete Docter',
        year=2015,
        country='USA',
        category='Comedy'
    ),
    schemas.MovieCreate(
        title='The Killing Fields',
        poster_url='https://fwcdn.pl/fpo/87/62/8762/7436542.3.jpg',
        background_url='https://fwcdn.pl/fph/87/62/8762/382830.1.jpg',
        director='Roland Joffé',
        year=1984,
        country='Great Britain',
        category='Drama'
    ),
    schemas.MovieCreate(
        title='Rain Man',
        poster_url='https://fwcdn.pl/fpo/10/08/1008/7881633.3.jpg',
        background_url='https://fwcdn.pl/fph/10/08/1008/184176_1.1.jpg',
        director='Barry Levinson',
        year=1988,
        country='USA',
        category='Drama'
    ),
    schemas.MovieCreate(
        title='The Lives of Others',
        poster_url='https://fwcdn.pl/fpo/31/75/293175/7393443.3.jpg',
        background_url='https://fwcdn.pl/fph/31/75/293175/134377.1.jpg',
        director='Florian Henckel',
        year=2006,
        country='Germany',
        category='Drama'
    ),
    schemas.MovieCreate(
        title='Kubo and the Two Strings',
        poster_url='https://fwcdn.pl/fpo/54/52/735452/7747994.3.jpg',
        background_url='https://fwcdn.pl/fph/54/52/735452/666495_1.1.jpg',
        director='Travis Knight',
        year=2016,
        country='USA',
        category='Family'
    ),
    schemas.MovieCreate(
        title='Stagecoach',
        poster_url='https://fwcdn.pl/fpo/16/95/31695/7229276_1.3.jpg',
        background_url='https://fwcdn.pl/fph/16/95/31695/574372.2.jpg',
        director='Travis Knight',
        year=1939,
        country='USA',
        category='Western'
    ),
    schemas.MovieCreate(
        title='Black Hawk Down',
        poster_url='https://fwcdn.pl/fpo/14/19/31419/7174828.3.jpg',
        background_url='https://fwcdn.pl/fph/14/19/31419/401299.1.jpg',
        director='Ridley Scott',
        year=2001,
        country='USA',
        category='War'
    ),
    schemas.MovieCreate(
        title='Citizen Kane',
        poster_url='https://fwcdn.pl/fpo/12/79/31279/7838678.3.jpg',
        background_url='https://fwcdn.pl/fph/12/79/31279/214800.1.jpg',
        director='Orson Welles',
        year=1941,
        country='USA',
        category='Drama'
    ),
    schemas.MovieCreate(
        title='The Last Samurai',
        poster_url='https://fwcdn.pl/fpo/64/47/36447/6902723.6.jpg',
        background_url='https://fwcdn.pl/fph/64/47/36447/225832.1.jpg',
        director='Edward Zwick',
        year=2003,
        country='USA',
        category='Drama'
    )
]
