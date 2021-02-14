import json
import random
import urllib.request
import urllib.parse

from app.db.base_class import Base
from app.db.session import db1, db2
from sqlalchemy.orm import Session

from app import crud, schemas
from app.db.models.relationship import Relationship
from app.core.config import settings


def generate_base_url(service_name: str, api_prefix: str) -> str:
    return f"http://{service_name}:80{api_prefix}/"


def init_db(db: Session) -> None:
    for dbb in (db1, db2):
        Base.metadata.drop_all(dbb)
        Base.metadata.create_all(dbb)

    users_resp = urllib.request.urlopen(generate_base_url(settings.USERS_SERVICE_NAME, settings.API_USERS))
    user_ids = list(map(
        lambda u: u['id'],
        json.loads(users_resp.read().decode('utf-8'))
    ))

    user_count = len(user_ids)
    followers_per_user = min(2, user_count)

    # db.query(Relationship).delete()
    for user_id in user_ids:

        # Randomize users followers until not following themselves
        follower_ids = []
        while True:
            follower_ids = random.sample(user_ids, followers_per_user)
            if user_id not in follower_ids:
                break

        for follower_id in follower_ids:
            relationship = schemas.RelationshipCreate(
                followed_user_id=user_id,
                user_id=follower_id
            )
            crud.relationship.create(db, obj_in=relationship)

    db.commit()
