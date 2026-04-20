from __future__ import annotations

from dataclasses import dataclass

import pandas as pd


@dataclass
class TrainingArtifacts:
    content_vectorizer: object
    content_matrix: object
    collaborative_model: object
    ranker: object


def train_hybrid_artifacts(song_rows: list[dict], interaction_rows: list[dict]) -> TrainingArtifacts:
    """Train offline artifacts for a larger deployment.

    The online recommender in `engine.py` is intentionally lightweight for live API latency.
    This trainer can run as a scheduled job once enough behavior exists.
    """
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    from surprise import Dataset, Reader, SVD
    from xgboost import XGBRanker

    songs = pd.DataFrame(song_rows)
    interactions = pd.DataFrame(interaction_rows)

    songs["content_text"] = (
        songs.get("track_name", "").fillna("")
        + " "
        + songs.get("artist_name", "").fillna("")
        + " "
        + songs.get("genre", "").fillna("")
        + " "
        + songs.get("album_name", "").fillna("")
    )
    vectorizer = TfidfVectorizer(max_features=20000, stop_words="english")
    content_matrix = vectorizer.fit_transform(songs["content_text"])
    _ = cosine_similarity(content_matrix[:1], content_matrix[: min(len(songs), 100)])

    if interactions.empty:
      reader = Reader(rating_scale=(0, 5))
      surprise_data = Dataset.load_from_df(pd.DataFrame([["cold", "start", 1.0]], columns=["user_id", "song_id", "rating"]), reader)
    else:
      reader = Reader(rating_scale=(0, 5))
      surprise_data = Dataset.load_from_df(interactions[["user_id", "song_id", "rating"]], reader)
    collaborative_model = SVD(n_factors=80, biased=True, random_state=42)
    collaborative_model.fit(surprise_data.build_full_trainset())

    ranker = XGBRanker(
        n_estimators=120,
        max_depth=5,
        learning_rate=0.06,
        subsample=0.9,
        colsample_bytree=0.9,
        objective="rank:pairwise",
        random_state=42,
    )
    if not interactions.empty and {"behavior_score", "time_score", "mood_score", "trend_score", "label", "group"}.issubset(interactions.columns):
        features = interactions[["behavior_score", "time_score", "mood_score", "trend_score"]]
        ranker.fit(features, interactions["label"], group=interactions["group"].tolist())

    return TrainingArtifacts(
        content_vectorizer=vectorizer,
        content_matrix=content_matrix,
        collaborative_model=collaborative_model,
        ranker=ranker,
    )
