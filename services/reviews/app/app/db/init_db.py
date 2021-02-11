import json
import random
import urllib.request
import urllib.parse

from datetime import datetime, timezone, timedelta

from pydantic import AnyUrl
from sqlalchemy.orm import Session
from uuid import UUID

from app import crud, schemas
from app.db.models.review import Review
from app.core.config import settings


def generate_base_url(service_name: str, api_prefix: str) -> str:
    return f"http://{service_name}:80{api_prefix}/"


def init_db(db: Session) -> None:
    movies_resp = urllib.request.urlopen(generate_base_url(settings.MOVIES_SERVICE_NAME, settings.API_MOVIES))
    users_resp = urllib.request.urlopen(generate_base_url(settings.USERS_SERVICE_NAME, settings.API_USERS))

    movie_ids = list(map(
        lambda m: UUID(m['id']),
        json.loads(movies_resp.read().decode('utf-8'))
    ))
    user_ids = list(map(
        lambda u: u['id'],
        json.loads(users_resp.read().decode('utf-8'))
    ))

    user_count = len(user_ids)
    reviews_per_movie = min(4, user_count)

    sample_comments = [
        None,
        None,
        None,
        None,
        None,
        None,
        None,
        None,
        None,
        'What a great movie!',
        'Better than X.',
        'I laughed my ass off',
        'Will they ever finish Avatar 2?',
        'This is a very long comment to span multiple lines in every possible display arrangement.',
        'Lorem ipsum dolor sit amet enim',
        'Another comment'
    ]

    db.query(Review).delete()
    for movie_id in movie_ids:
        for user_id in random.sample(user_ids, reviews_per_movie):
            review = schemas.ReviewCreate(
                user_id=user_id,
                movie_id=movie_id,
                rating=random.randint(1, 10),
                comment=random.choice(sample_comments),
            )
            review_date = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 100),
                                                                 minutes=random.randint(0, 10000))
            crud.review.create_with_date(db, obj_in=review, creation_time=review_date)

    db.commit()
