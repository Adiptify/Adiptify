# Performance & Scale Recommendations

- Use Redis caching for frequent item retrievals.
- Add indexes on `Item.topics`, `Item.difficulty`, `Attempt.user+item`.
- Rate-limit AI endpoints and queue heavy generation.
- Use Mongo connection pooling and graceful shutdown.
- Consider sharding or read-replicas for MongoDB when scaling.


