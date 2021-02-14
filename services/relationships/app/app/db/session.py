import uuid
import hashlib

from sqlalchemy import create_engine
from sqlalchemy.ext.horizontal_shard import ShardedSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.models import Relationship
from app.db.base_class import Base
from sqlalchemy.sql import visitors, operators

db1 = create_engine(settings.DATABASE1_URL, pool_pre_ping=True, pool_size=settings.POOL_SIZE,
                    max_overflow=settings.POOL_MAX_OVERFLOW, pool_timeout=settings.POOL_TIMEOUT)
db2 = create_engine(settings.DATABASE2_URL, pool_pre_ping=True, pool_size=settings.POOL_SIZE,
                    max_overflow=settings.POOL_MAX_OVERFLOW, pool_timeout=settings.POOL_TIMEOUT)

create_session = sessionmaker(class_=ShardedSession, autocommit=False, autoflush=False)

create_session.configure(
    shards={
        "db1": db1,
        "db2": db2
    }
)


# Sharding by user_id
def shard_lookup(user_id: uuid.UUID):
    if user_id.int % 2 == 1:
        return "db1"
    else:
        return "db2"


def shard_chooser(mapper, instance, clause=None):
    """shard chooser.
    looks at the given instance and returns a shard id
    """
    if isinstance(instance, Relationship):
        return shard_lookup(instance.user_id)
    else:
        return "db1"


def id_chooser(query, ident):
    """id chooser.

    given a primary key, returns a list of shards
    to search.  here, we don't have any particular information from a
    pk so we just return all shard ids.

    """

    return ["db1", "db2"]


def query_chooser(query):
    """query chooser.

    this also returns a list of shard ids, which can
    just be all of them.  but here we'll search into the Query in order
    to try to narrow down the list of shards to query.

    """
    ids = []

    # we'll grab continent names as we find them
    # and convert to shard ids
    for column, operator, value in _get_query_comparisons(query):
        # "shares_lineage()" returns True if both columns refer to the same
        # statement column, adjusting for any annotations present.
        # (an annotation is an internal clone of a Column object
        # and occur when using ORM-mapped attributes like
        # "WeatherLocation.continent"). A simpler comparison, though less
        # accurate, would be "column.key == 'continent'".
        if column.shares_lineage(Relationship.__table__.c.id):
            if operator == operators.eq:
                ids.append(shard_lookup(value))
            elif operator == operators.in_op:
                ids.extend(shard_lookup(v) for v in value)

    if len(ids) == 0:
        return ["db1", "db2"]
    else:
        return ids


def _get_query_comparisons(query):
    """Search an orm.Query object for binary expressions.

    Returns expressions which match a Column against one or more
    literal values as a list of tuples of the form
    (column, operator, values).   "values" is a single value
    or tuple of values depending on the operator.

    """
    binds = {}
    clauses = set()
    comparisons = []

    def visit_bindparam(bind):
        # visit a bind parameter.

        # check in _params for it first
        if bind.key in query._params:
            value = query._params[bind.key]
        elif bind.callable:
            # some ORM functions (lazy loading)
            # place the bind's value as a
            # callable for deferred evaluation.
            value = bind.callable()
        else:
            # just use .value
            value = bind.value

        binds[bind] = value

    def visit_column(column):
        clauses.add(column)

    def visit_binary(binary):
        # special handling for "col IN (params)"
        if (
                binary.left in clauses
                and binary.operator == operators.in_op
                and hasattr(binary.right, "clauses")
        ):
            comparisons.append(
                (
                    binary.left,
                    binary.operator,
                    tuple(binds[bind] for bind in binary.right.clauses),
                )
            )
        elif binary.left in clauses and binary.right in binds:
            comparisons.append(
                (binary.left, binary.operator, binds[binary.right])
            )

        elif binary.left in binds and binary.right in clauses:
            comparisons.append(
                (binary.right, binary.operator, binds[binary.left])
            )

    # here we will traverse through the query's criterion, searching
    # for SQL constructs.  We will place simple column comparisons
    # into a list.
    if query._criterion is not None:
        visitors.traverse_depthfirst(
            query._criterion,
            {},
            {
                "bindparam": visit_bindparam,
                "binary": visit_binary,
                "column": visit_column,
            },
        )
    return comparisons


create_session.configure(
    shard_chooser=shard_chooser,
    id_chooser=id_chooser,
    query_chooser=query_chooser,
)

SessionLocal = create_session
