from app.sm2 import calculate_sm2
from datetime import datetime, timedelta


def test_sm2_perfect_recall():
    # Initial state: 0 reps, 2.5 ease, 0 interval
    reps, interval, ease, next_review = calculate_sm2(5, 0, 0, 2.5)
    assert reps == 1
    assert interval == 1
    assert ease > 2.5
    assert next_review > datetime.now()


def test_sm2_hard_recall():
    # Initial state
    reps, interval, ease, next_review = calculate_sm2(3, 1, 1, 2.6)
    assert reps == 2
    assert interval == 6
    assert ease < 2.6


def test_sm2_forget():
    # q < 3 should reset reps and interval
    reps, interval, ease, next_review = calculate_sm2(2, 5, 10, 2.5)
    assert reps == 0
    assert interval == 1
    assert ease == 2.5
